// pages/Admin.jsx - Complete Admin Panel with JSON Bin Storage (No localStorage)
import { Helmet } from "react-helmet-async";
import { Row, Col, Card, Button, Form, Table, Modal, Alert, Spinner } from "react-bootstrap";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ImageUploader from "../components/ImageUploader";
import {
  getBlogs, saveBlogs, addBlog, updateBlog, deleteBlog,
  getEvents, saveEvents, addEvent, updateEvent, deleteEvent,
  getGallery, saveGallery, addGalleryImage, deleteGalleryImage,
  getTestimonials, saveTestimonials, addTestimonial, updateTestimonial, deleteTestimonial,
  getFAQ, saveFAQ,
  getPartners, savePartners, addPartner, updatePartner, deletePartner,
  getFeeStructure, saveFeeStructure,
  getPageContent, savePageContent,
  getFooterSettings, saveFooterSettings,
  getSettings, saveSettings
} from "../services/dataService";

// ============================================================
// ADMIN AUTHENTICATION HOOK (Uses localStorage for session only)
// ============================================================
const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('adminAuthenticated');
      const expiry = localStorage.getItem('adminExpiry');
      
      if (auth === 'true' && expiry && new Date().getTime() < parseInt(expiry)) {
        setIsAuthenticated(true);
      } else if (auth === 'true') {
        localStorage.removeItem('adminAuthenticated');
        localStorage.removeItem('adminExpiry');
        navigate('/admin/login');
      } else {
        navigate('/admin/login');
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, [navigate]);

  const login = (password) => {
    if (password === import.meta.env.VITE_ADMIN_PASSWORD || password === 'admin123') {
      const expiry = new Date().getTime() + 24 * 60 * 60 * 1000;
      localStorage.setItem('adminAuthenticated', 'true');
      localStorage.setItem('adminExpiry', expiry.toString());
      setIsAuthenticated(true);
      navigate('/admin/dashboard');
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminExpiry');
    setIsAuthenticated(false);
    navigate('/admin/login');
  };

  return { isAuthenticated, isLoading, login, logout };
};

// ============================================================
// ADMIN LOGIN COMPONENT
// ============================================================
const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      if (onLogin(password)) {
        setPassword('');
      } else {
        setError('Invalid password. Please try again.');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <div className="text-center mb-4">
          <div className="admin-logo mb-3">
            <i className="fas fa-school fa-3x text-navy"></i>
          </div>
          <h2 className="h4 fw-bold text-navy">Admin Dashboard</h2>
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
              <><Spinner as="span" animation="border" size="sm" className="me-2" /> Logging in...</>
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
  );
};

// ============================================================
// SIDEBAR COMPONENT
// ============================================================
const AdminSidebar = ({ activeTab, onTabChange, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { id: 'blogs', label: 'Blogs & News', icon: 'fas fa-newspaper' },
    { id: 'events', label: 'Events', icon: 'fas fa-calendar-alt' },
    { id: 'gallery', label: 'Gallery', icon: 'fas fa-images' },
    { id: 'testimonials', label: 'Testimonials', icon: 'fas fa-star' },
    { id: 'faq', label: 'FAQ', icon: 'fas fa-question-circle' },
    { id: 'fee-structure', label: 'Fee Structure', icon: 'fas fa-money-bill-wave' },
    { id: 'partner', label: 'Partners', icon: 'fas fa-handshake' },
    { id: 'pages', label: 'Pages Content', icon: 'fas fa-file-alt' },
    { id: 'footer', label: 'Footer Settings', icon: 'fas fa-copyright' },
    { id: 'settings', label: 'Settings', icon: 'fas fa-cog' },
  ];

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <i className="fas fa-school me-2"></i>
        <span>KPS Admin</span>
      </div>
      <nav className="admin-sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`admin-sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <button className="admin-sidebar-logout" onClick={onLogout}>
        <i className="fas fa-sign-out-alt"></i>
        <span>Logout</span>
      </button>
    </div>
  );
};

// ============================================================
// DASHBOARD OVERVIEW COMPONENT
// ============================================================
const DashboardOverview = ({ stats }) => {
  const statCards = [
    { title: 'Blog Posts', value: stats.blogs, icon: 'fas fa-newspaper', color: '#0d65fb' },
    { title: 'Events', value: stats.events, icon: 'fas fa-calendar-alt', color: '#ff0080' },
    { title: 'Gallery Items', value: stats.gallery, icon: 'fas fa-images', color: '#48bb78' },
    { title: 'Testimonials', value: stats.testimonials, icon: 'fas fa-star', color: '#ed8936' },
    { title: 'FAQ Items', value: stats.faq, icon: 'fas fa-question-circle', color: '#9f7aea' },
    { title: 'Partners', value: stats.partners, icon: 'fas fa-handshake', color: '#38b2ac' },
  ];

  return (
    <div>
      <h3 className="h5 fw-bold mb-4">Dashboard Overview</h3>
      <Row className="g-4">
        {statCards.map((stat, idx) => (
          <Col key={idx} lg={4} md={6}>
            <Card className="admin-stat-card border-0 shadow-sm">
              <Card.Body className="d-flex align-items-center justify-content-between p-3">
                <div>
                  <div className="admin-stat-value">{stat.value}</div>
                  <div className="admin-stat-label">{stat.title}</div>
                </div>
                <div className="admin-stat-icon" style={{ backgroundColor: `${stat.color}15` }}>
                  <i className={stat.icon} style={{ color: stat.color }}></i>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      
      <Row className="mt-4">
        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white fw-semibold border-0 pt-3 pb-2">
              <i className="fas fa-info-circle me-2 text-navy"></i>
              Quick Actions
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-wrap gap-2">
                <Button size="sm" className="btn-navy" onClick={() => window.location.hash = 'blogs'}>
                  <i className="fas fa-plus me-1"></i> Add Blog Post
                </Button>
                <Button size="sm" className="btn-outline-navy" onClick={() => window.location.hash = 'events'}>
                  <i className="fas fa-plus me-1"></i> Add Event
                </Button>
                <Button size="sm" className="btn-outline-navy" onClick={() => window.location.hash = 'gallery'}>
                  <i className="fas fa-plus me-1"></i> Add Gallery Image
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white fw-semibold border-0 pt-3 pb-2">
              <i className="fas fa-globe me-2 text-navy"></i>
              Site Information
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Site URL:</span>
                <span className="small">{window.location.origin}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted small">Last Published:</span>
                <span className="small">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted small">Admin Version:</span>
                <span className="small">2.0.0</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

// ============================================================
// BLOGS MANAGER - No localStorage
// ============================================================
const BlogsManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    fullStory: '',
    featuredImage: '',
    date: '',
    author: '',
    category: ''
  });
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [saving, setSaving] = useState(false);

  const generateSlug = (title) => {
    if (!title) return '';
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const loadBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBlogs();
      setBlogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading blogs:', error);
      setAlert({ show: true, type: 'danger', message: 'Failed to load blogs.' });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSaveBlog = async () => {
    if (!formData.title || !formData.excerpt || !formData.content) {
      setAlert({ show: true, type: 'danger', message: 'Please fill in title, excerpt, and content.' });
      setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
      return;
    }

    setSaving(true);
    try {
      let slug = formData.slug || generateSlug(formData.title);

      const blogData = {
        title: formData.title,
        slug: slug,
        excerpt: formData.excerpt,
        content: formData.content,
        fullStory: formData.fullStory || '',
        featuredImage: formData.featuredImage || '/images/placeholder.jpg',
        date: formData.date || getTodayDate(),
        author: formData.author || 'Admin',
        category: formData.category || 'General'
      };

      let result;
      if (editingBlog) {
        result = await updateBlog(editingBlog.id, blogData);
      } else {
        result = await addBlog(blogData);
      }

      if (result) {
        await loadBlogs();
        handleCloseModal();
        setAlert({ 
          show: true, 
          type: 'success', 
          message: `Blog ${editingBlog ? 'updated' : 'added'} successfully!` 
        });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      setAlert({ show: true, type: 'danger', message: 'Failed to save blog: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    
    try {
      const result = await deleteBlog(id);
      if (result) {
        await loadBlogs();
        setAlert({ show: true, type: 'success', message: 'Blog deleted successfully!' });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      setAlert({ show: true, type: 'danger', message: 'Failed to delete blog.' });
    }
  };

  const handleImageUpload = (imageUrl, displayUrl, filename, deleteUrl) => {
    setFormData(prev => ({ ...prev, featuredImage: imageUrl }));
    setImageUrl(imageUrl);
  };

  const handleOpenModal = (blog = null) => {
    if (blog) {
      setEditingBlog(blog);
      setFormData({
        id: blog.id || '',
        title: blog.title || '',
        slug: blog.slug || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        fullStory: blog.fullStory || '',
        featuredImage: blog.featuredImage || '',
        date: blog.date || getTodayDate(),
        author: blog.author || '',
        category: blog.category || ''
      });
      setImageUrl(blog.featuredImage || null);
    } else {
      setEditingBlog(null);
      setFormData({
        id: '',
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        fullStory: '',
        featuredImage: '',
        date: getTodayDate(),
        author: '',
        category: ''
      });
      setImageUrl(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBlog(null);
    setFormData({
      id: '',
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      fullStory: '',
      featuredImage: '',
      date: '',
      author: '',
      category: ''
    });
    setImageUrl(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'title' && !formData.slug) {
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
    }
  };

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="h5 fw-bold mb-0">Manage Blog Posts ({blogs.length})</h3>
        <Button className="btn-navy" size="sm" onClick={() => handleOpenModal()}>
          <i className="fas fa-plus me-1"></i> Add New Blog
        </Button>
      </div>
      
      {alert.show && (
        <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false, type: '', message: '' })} className="mb-3">
          {alert.message}
        </Alert>
      )}
      
      <div className="admin-table-wrapper">
        <Table responsive hover className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Slug</th>
              <th>Category</th>
              <th>Author</th>
              <th>Date</th>
              <th>Featured Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center text-muted py-4">
                  No blog posts found. Click "Add New Blog" to create your first post.
                </td>
              </tr>
            ) : (
              blogs.map(blog => (
                <tr key={blog.id}>
                  <td>{blog.id}</td>
                  <td className="fw-semibold">{blog.title}</td>
                  <td><code className="small">{blog.slug || 'N/A'}</code></td>
                  <td>{blog.category || 'General'}</td>
                  <td>{blog.author || 'Admin'}</td>
                  <td>{blog.date}</td>
                  <td>
                    {blog.featuredImage && (
                      <img 
                        src={blog.featuredImage} 
                        alt="thumb" 
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} 
                        onError={(e) => { e.target.src = ''; }} 
                      />
                    )}
                  </td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleOpenModal(blog)}>
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteBlog(blog.id)}>
                      <i className="fas fa-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
      
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingBlog ? 'Edit Blog Post' : 'Add New Blog Post'}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Title *</Form.Label>
              <Form.Control 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleFormChange} 
                placeholder="Enter blog title" 
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Slug (URL)</Form.Label>
              <Form.Control 
                type="text" 
                name="slug" 
                value={formData.slug} 
                onChange={handleFormChange} 
                placeholder="auto-generated-from-title" 
              />
              <Form.Text className="text-muted">Used in the URL. Auto-generated from title if left empty.</Form.Text>
            </Form.Group>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Category</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="category" 
                    value={formData.category} 
                    onChange={handleFormChange} 
                    placeholder="e.g., Education, Parenting, Academics" 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Author</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="author" 
                    value={formData.author} 
                    onChange={handleFormChange} 
                    placeholder="Author name" 
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="date" 
                    value={formData.date} 
                    onChange={handleFormChange} 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <ImageUploader 
                  onImageUpload={handleImageUpload}
                  currentImage={imageUrl}
                  label="Featured Image"
                  maxSize={5}
                />
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Excerpt *</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2} 
                name="excerpt" 
                value={formData.excerpt} 
                onChange={handleFormChange} 
                placeholder="Short summary of the blog post that appears on the blog listing page..." 
              />
              <Form.Text className="text-muted">This appears on the blog listing page and in social media previews.</Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Content *</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={6} 
                name="content" 
                value={formData.content} 
                onChange={handleFormChange} 
                placeholder="Full blog post content. Use # for headings, ** for bold, * for italic." 
              />
              <Form.Text className="text-muted">Supports markdown-style formatting: # Heading, **bold**, *italic*, and HTML.</Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Full Story (Optional)</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4} 
                name="fullStory" 
                value={formData.fullStory} 
                onChange={handleFormChange} 
                placeholder="Additional content that appears after the main content. Supports the same formatting." 
              />
              <Form.Text className="text-muted">This appears as a 'More Details' section after the main content.</Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal} disabled={saving}>Cancel</Button>
          <Button className="btn-navy" onClick={handleSaveBlog} disabled={saving}>
            {saving ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                {editingBlog ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              editingBlog ? 'Update Blog' : 'Save Blog'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

// ============================================================
// EVENTS MANAGER - No localStorage
// ============================================================
const EventsManager = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '', date: '', description: '', time: '', location: '', category: '', color: ''
  });
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [saving, setSaving] = useState(false);

  const categories = [
    { id: "academic", name: "Academic", color: "#0d65fb" },
    { id: "sports", name: "Sports", color: "#48bb78" },
    { id: "cultural", name: "Cultural", color: "#9f7aea" },
    { id: "meeting", name: "Meetings", color: "#ed8936" },
    { id: "ceremony", name: "Ceremonies", color: "#ff0080" },
  ];

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading events:', error);
      setAlert({ show: true, type: 'danger', message: 'Failed to load events.' });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSaveEvent = async () => {
    if (!formData.title || !formData.date || !formData.description) {
      setAlert({ show: true, type: 'danger', message: 'Please fill in all required fields.' });
      setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
      return;
    }

    setSaving(true);
    try {
      const eventData = {
        title: formData.title,
        date: formData.date,
        description: formData.description,
        time: formData.time || '',
        location: formData.location || '',
        category: formData.category || 'academic',
        color: formData.color || '#0d65fb'
      };

      let result;
      if (editingEvent) {
        result = await updateEvent(editingEvent.id, eventData);
      } else {
        result = await addEvent(eventData);
      }

      if (result) {
        await loadEvents();
        handleCloseModal();
        setAlert({ 
          show: true, 
          type: 'success', 
          message: `Event ${editingEvent ? 'updated' : 'added'} successfully!` 
        });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
      }
    } catch (error) {
      console.error('Error saving event:', error);
      setAlert({ show: true, type: 'danger', message: 'Failed to save event: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      const result = await deleteEvent(id);
      if (result) {
        await loadEvents();
        setAlert({ show: true, type: 'success', message: 'Event deleted successfully!' });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      setAlert({ show: true, type: 'danger', message: 'Failed to delete event.' });
    }
  };

  const handleOpenModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title || '',
        date: event.date || '',
        description: event.description || '',
        time: event.time || '',
        location: event.location || '',
        category: event.category || 'academic',
        color: event.color || '#0d65fb'
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '', date: '', description: '', time: '', location: '', category: 'academic', color: '#0d65fb'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setFormData({
      title: '', date: '', description: '', time: '', location: '', category: 'academic', color: '#0d65fb'
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'category') {
      const cat = categories.find(c => c.id === value);
      if (cat) setFormData(prev => ({ ...prev, color: cat.color }));
    }
  };

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="h5 fw-bold mb-0">Manage Events ({events.length})</h3>
        <Button className="btn-navy" size="sm" onClick={() => handleOpenModal()}>
          <i className="fas fa-plus me-1"></i> Add New Event
        </Button>
      </div>
      {alert.show && <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false })} className="mb-3">{alert.message}</Alert>}
      <div className="admin-table-wrapper">
        <Table responsive hover className="admin-table">
          <thead><tr><th>ID</th><th>Title</th><th>Category</th><th>Date</th><th>Location</th><th>Actions</th></tr></thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-muted py-4">
                  No events found. Click "Add New Event" to create one.
                </td>
              </tr>
            ) : (
              events.map(event => (
                <tr key={event.id}>
                  <td>{event.id}</td>
                  <td className="fw-semibold">{event.title}</td>
                  <td><span className="badge" style={{ backgroundColor: event.color, color: 'white' }}>{event.category}</span></td>
                  <td>{event.date}</td>
                  <td>{event.location || 'TBD'}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleOpenModal(event)}><i className="fas fa-edit"></i></Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteEvent(event.id)}><i className="fas fa-trash"></i></Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton><Modal.Title>{editingEvent ? 'Edit Event' : 'Add New Event'}</Modal.Title></Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <Form>
            <Form.Group className="mb-3"><Form.Label className="fw-semibold small">Title *</Form.Label><Form.Control type="text" name="title" value={formData.title} onChange={handleFormChange} /></Form.Group>
            <Row>
              <Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-semibold small">Date *</Form.Label><Form.Control type="date" name="date" value={formData.date} onChange={handleFormChange} /></Form.Group></Col>
              <Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-semibold small">Time</Form.Label><Form.Control type="text" name="time" value={formData.time} onChange={handleFormChange} placeholder="e.g., 9:00 AM" /></Form.Group></Col>
            </Row>
            <Form.Group className="mb-3"><Form.Label className="fw-semibold small">Category</Form.Label><Form.Select name="category" value={formData.category} onChange={handleFormChange}>{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</Form.Select></Form.Group>
            <Form.Group className="mb-3"><Form.Label className="fw-semibold small">Location</Form.Label><Form.Control type="text" name="location" value={formData.location} onChange={handleFormChange} placeholder="Event location" /></Form.Group>
            <Form.Group className="mb-3"><Form.Label className="fw-semibold small">Description *</Form.Label><Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleFormChange} /></Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal} disabled={saving}>Cancel</Button>
          <Button className="btn-navy" onClick={handleSaveEvent} disabled={saving}>
            {saving ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                {editingEvent ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              editingEvent ? 'Update Event' : 'Save Event'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

// ============================================================
// GALLERY MANAGER - No localStorage
// ============================================================
const GalleryManager = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [formData, setFormData] = useState({ filename: '', alt: '', category: '' });
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [saving, setSaving] = useState(false);

  const categories = ['academics', 'sports', 'cultural', 'events', 'facilities'];

  const DEFAULT_IMAGES = [
    { id: 1, filename: "academics1", alt: "Classroom learning", category: "academics", imageUrl: "/images/optimized/gallery/academics1.jpg" },
    { id: 2, filename: "academics2", alt: "Science experiment", category: "academics", imageUrl: "/images/optimized/gallery/academics2.jpg" },
    { id: 3, filename: "academics3", alt: "Library reading", category: "academics", imageUrl: "/images/optimized/gallery/academics3.jpg" },
    { id: 4, filename: "academics4", alt: "Computer class", category: "academics", imageUrl: "/images/optimized/gallery/academics4.jpg" },
    { id: 5, filename: "sports1", alt: "Football match", category: "sports", imageUrl: "/images/optimized/gallery/sports1.jpg" },
    { id: 6, filename: "sports2", alt: "Athletics", category: "sports", imageUrl: "/images/optimized/gallery/sports2.jpg" },
    { id: 7, filename: "sports5", alt: "Netball", category: "sports", imageUrl: "/images/optimized/gallery/sports5.jpg" },
    { id: 8, filename: "sports4", alt: "Swimming gala", category: "sports", imageUrl: "/images/optimized/gallery/sports4.jpg" },
    { id: 9, filename: "cultural1", alt: "Traditional dance", category: "cultural", imageUrl: "/images/optimized/gallery/cultural1.jpg" },
    { id: 10, filename: "cultural2", alt: "Music festival", category: "cultural", imageUrl: "/images/optimized/gallery/cultural2.jpg" },
    { id: 11, filename: "cultural3", alt: "Drama performance", category: "cultural", imageUrl: "/images/optimized/gallery/cultural3.jpg" },
    { id: 12, filename: "cultural4", alt: "Art exhibition", category: "cultural", imageUrl: "/images/optimized/gallery/cultural4.jpg" },
    { id: 13, filename: "events1", alt: "Graduation", category: "events", imageUrl: "/images/optimized/gallery/events1.jpg" },
    { id: 14, filename: "events2", alt: "Prize giving day", category: "events", imageUrl: "/images/optimized/gallery/events2.jpg" },
    { id: 15, filename: "events3", alt: "Parents day", category: "events", imageUrl: "/images/optimized/gallery/events3.jpg" },
    { id: 16, filename: "events5", alt: "Open day", category: "events", imageUrl: "/images/optimized/gallery/events5.jpg" },
    { id: 17, filename: "facilities1", alt: "School library", category: "facilities", imageUrl: "/images/optimized/gallery/facilities1.jpg" },
    { id: 18, filename: "facilities2", alt: "Science lab", category: "facilities", imageUrl: "/images/optimized/gallery/facilities2.jpg" },
    { id: 19, filename: "facilities3", alt: "Playground", category: "facilities", imageUrl: "/images/optimized/gallery/facilities3.jpg" },
    { id: 20, filename: "facilities4", alt: "Computer lab", category: "facilities", imageUrl: "/images/optimized/gallery/facilities4.jpg" },
    { id: 21, filename: "facilities5", alt: "Dorm", category: "facilities", imageUrl: "/images/optimized/gallery/facilities5.jpg" },
    { id: 22, filename: "facilities6", alt: "dorm", category: "facilities", imageUrl: "/images/optimized/gallery/facilities6.jpg" },
    { id: 23, filename: "facilities7", alt: "playground", category: "facilities", imageUrl: "/images/optimized/gallery/facilities7.jpg" },
    { id: 24, filename: "slide2", alt: "School van", category: "facilities", imageUrl: "/images/optimized/gallery/slide2.jpg" },
    { id: 25, filename: "academics5", alt: "Academic tour", category: "academics", imageUrl: "/images/optimized/gallery/academics5.jpg" },
    { id: 26, filename: "practicals2", alt: "practicals", category: "academics", imageUrl: "/images/optimized/gallery/practicals2.jpg" },
    { id: 27, filename: "facilities8", alt: "School van", category: "facilities", imageUrl: "/images/optimized/gallery/facilities8.jpg" },
  ];

  const getDefaultImageIds = () => new Set(DEFAULT_IMAGES.map(img => img.id));
  const getDefaultFilenames = () => new Set(DEFAULT_IMAGES.map(img => img.filename));

  const loadImages = useCallback(async () => {
    setLoading(true);
    try {
      const storedGallery = await getGallery();
      const defaultFilenames = getDefaultFilenames();
      
      let allImages = [...DEFAULT_IMAGES];
      
      if (storedGallery && storedGallery.length > 0) {
        storedGallery.forEach((item) => {
          const isDefault = defaultFilenames.has(item.filename);
          if (!isDefault) {
            const maxId = Math.max(...allImages.map(img => img.id), 0);
            const newId = maxId + 1;
            
            allImages.push({
              id: newId,
              filename: item.filename,
              alt: item.alt || item.filename.replace(/-/g, ' ').replace(/\d+$/, '').trim(),
              category: item.category || 'facilities',
              imageUrl: item.imageUrl || null,
              isUploaded: true
            });
          }
        });
      }
      
      setImages(allImages);
      console.log('Gallery loaded:', allImages.length, 'images total');
    } catch (error) {
      console.error('Error loading gallery:', error);
      setImages(DEFAULT_IMAGES);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveImages = async (newImages) => {
    const defaultFilenames = getDefaultFilenames();
    const uploadedImages = newImages.filter(img => {
      return img.isUploaded === true || !defaultFilenames.has(img.filename);
    });
    
    const galleryMetadata = uploadedImages.map(img => ({
      id: img.id,
      filename: img.filename,
      alt: img.alt,
      category: img.category,
      imageUrl: img.imageUrl
    }));
    
    await saveGallery(galleryMetadata);
    setImages(newImages);
    console.log('Gallery saved:', newImages.length, 'images total');
  };

  const handleImageUpload = (imageUrl, displayUrl, filename, deleteUrl) => {
    setFormData(prev => ({ ...prev, filename: filename }));
    setImageUrl(imageUrl);
    console.log('Image uploaded to ImgBB:', imageUrl);
  };

  const handleOpenModal = (image = null) => {
    if (image) {
      setEditingImage(image);
      setFormData({ 
        filename: image.filename, 
        alt: image.alt, 
        category: image.category || 'facilities' 
      });
      setImageUrl(image.imageUrl || null);
    } else {
      setEditingImage(null);
      setFormData({ filename: '', alt: '', category: 'academics' });
      setImageUrl(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => { 
    setShowModal(false); 
    setEditingImage(null); 
    setFormData({ filename: '', alt: '', category: '' });
    setImageUrl(null);
  };

  const handleFormChange = (e) => { 
    setFormData({ ...formData, [e.target.name]: e.target.value }); 
  };

  const handleSaveImage = async () => {
    if (!formData.filename || !formData.alt) {
      setAlert({ show: true, type: 'danger', message: 'Please fill in all required fields.' });
      setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
      return;
    }

    const duplicate = images.some(img => 
      img.filename === formData.filename && 
      (!editingImage || img.id !== editingImage.id)
    );
    
    if (duplicate) {
      setAlert({ show: true, type: 'danger', message: 'An image with this filename already exists. Please use a unique filename.' });
      setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
      return;
    }

    setSaving(true);
    try {
      let newImages;
      if (editingImage) {
        const defaultIds = getDefaultImageIds();
        const isDefault = defaultIds.has(editingImage.id);
        const newFilename = isDefault ? editingImage.filename : formData.filename;
        
        newImages = images.map(img => 
          img.id === editingImage.id 
            ? { 
                ...img, 
                filename: newFilename,
                alt: formData.alt, 
                category: formData.category,
                imageUrl: imageUrl || img.imageUrl,
                isUploaded: isDefault ? false : true
              } 
            : img
        );
      } else {
        const maxId = Math.max(...images.map(img => img.id), 0);
        const newId = maxId + 1;
        const newImage = {
          id: newId,
          filename: formData.filename,
          alt: formData.alt,
          category: formData.category,
          imageUrl: imageUrl,
          isUploaded: true
        };
        newImages = [...images, newImage];
      }
      
      await saveImages(newImages);
      handleCloseModal();
      setAlert({ show: true, type: 'success', message: `Image ${editingImage ? 'updated' : 'added'} successfully!` });
      setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
    } catch (error) {
      console.error('Error saving image:', error);
      setAlert({ show: true, type: 'danger', message: 'Failed to save image: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImage = async (id) => {
    const imageToDelete = images.find(img => img.id === id);
    if (!imageToDelete) {
      setAlert({ show: true, type: 'warning', message: 'Image not found.' });
      setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
      return;
    }
    
    const defaultIds = getDefaultImageIds();
    const isDefault = defaultIds.has(id) || imageToDelete.isUploaded === false;
    
    if (isDefault) {
      setAlert({ show: true, type: 'warning', message: 'Default images cannot be deleted. You can only delete uploaded images.' });
      setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete "${imageToDelete.alt}"?`)) {
      try {
        const newImages = images.filter(img => img.id !== id);
        await saveImages(newImages);
        setAlert({ show: true, type: 'success', message: 'Image deleted successfully!' });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
      } catch (error) {
        console.error('Error deleting image:', error);
        setAlert({ show: true, type: 'danger', message: 'Failed to delete image.' });
      }
    }
  };

  const getImageSrc = (image) => {
    return image.imageUrl || `/images/optimized/gallery/${image.filename}.jpg`;
  };

  const filteredImages = selectedCategory === 'all' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h3 className="h5 fw-bold mb-0">Manage Gallery Images</h3>
        <div className="d-flex gap-2">
          <Form.Select 
            size="sm" 
            style={{ width: '150px' }} 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </Form.Select>
          <Button className="btn-navy" size="sm" onClick={() => handleOpenModal()}>
            <i className="fas fa-plus me-1"></i> Add Image
          </Button>
        </div>
      </div>
      
      {alert.show && (
        <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false })} className="mb-3">
          {alert.message}
        </Alert>
      )}
      
      <div className="admin-gallery-stats mb-3">
        <span className="text-muted small">
          Showing {filteredImages.length} of {images.length} images
          {selectedCategory !== 'all' && ` in ${selectedCategory}`}
          <span className="ms-2 text-muted">(Default: {DEFAULT_IMAGES.length}, Uploaded: {images.filter(img => img.isUploaded).length})</span>
        </span>
      </div>
      
      <div className="admin-gallery-grid">
        {filteredImages.map(image => (
          <div key={image.id} className="admin-gallery-item">
            <div className="admin-gallery-image">
              <img 
                src={getImageSrc(image)} 
                alt={image.alt} 
                onError={(e) => { e.target.src = ''; }} 
              />
              <div className="admin-gallery-overlay">
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => handleOpenModal(image)}
                  title="Edit image"
                >
                  <i className="fas fa-edit"></i>
                </Button>
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={() => handleDeleteImage(image.id)}
                  title={image.isUploaded ? "Delete image" : "Cannot delete default image"}
                  disabled={!image.isUploaded}
                >
                  <i className="fas fa-trash"></i>
                </Button>
              </div>
              {!image.isUploaded && (
                <span className="admin-gallery-badge badge bg-secondary" style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '0.6rem' }}>
                  Default
                </span>
              )}
            </div>
            <div className="admin-gallery-info">
              <div className="fw-semibold small">{image.alt}</div>
              <div className="text-muted small">{image.filename}</div>
              <div><span className="badge bg-secondary">{image.category}</span></div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredImages.length === 0 && (
        <div className="text-center py-5">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }} aria-hidden="true">🖼️</div>
          <h4 className="text-muted">No images found</h4>
          <p className="text-muted">Try selecting a different category or add a new image.</p>
        </div>
      )}

      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingImage ? 'Edit Gallery Image' : 'Add New Gallery Image'}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <Form>
            <ImageUploader 
              onImageUpload={handleImageUpload}
              currentImage={imageUrl}
              label="Upload Image *"
              maxSize={5}
            />
            
            <Form.Group className="mb-3 mt-3">
              <Form.Label className="fw-semibold small">Filename *</Form.Label>
              <Form.Control 
                type="text" 
                name="filename" 
                value={formData.filename} 
                onChange={handleFormChange} 
                placeholder="e.g., academics1 (without extension)"
                disabled={editingImage && !editingImage.isUploaded}
              />
              {editingImage && !editingImage.isUploaded && (
                <Form.Text className="text-warning">Default image filenames cannot be changed.</Form.Text>
              )}
              <Form.Text className="text-muted">Use lowercase letters, numbers, and hyphens only.</Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Alt Text *</Form.Label>
              <Form.Control 
                type="text" 
                name="alt" 
                value={formData.alt} 
                onChange={handleFormChange} 
                placeholder="Descriptive alt text for accessibility" 
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Category</Form.Label>
              <Form.Select name="category" value={formData.category} onChange={handleFormChange}>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal} disabled={saving}>Cancel</Button>
          <Button className="btn-navy" onClick={handleSaveImage} disabled={saving}>
            {saving ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                {editingImage ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              editingImage ? 'Update Image' : 'Save Image'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .admin-gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }
        .admin-gallery-item {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .admin-gallery-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }
        .admin-gallery-image {
          position: relative;
          aspect-ratio: 4/3;
          overflow: hidden;
          background: #f5f7fb;
        }
        .admin-gallery-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .admin-gallery-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .admin-gallery-item:hover .admin-gallery-overlay {
          opacity: 1;
        }
        .admin-gallery-overlay .btn {
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: none;
        }
        .admin-gallery-overlay .btn-primary {
          background: #0d65fb;
        }
        .admin-gallery-overlay .btn-danger {
          background: #dc3545;
        }
        .admin-gallery-overlay .btn-danger:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .admin-gallery-overlay .btn:hover {
          transform: scale(1.1);
        }
        .admin-gallery-info {
          padding: 0.75rem;
          text-align: center;
        }
        .admin-gallery-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 0.6rem;
          padding: 2px 8px;
          border-radius: 12px;
          background: rgba(108, 117, 125, 0.9);
          color: white;
        }
        .admin-gallery-stats {
          padding: 0.5rem 0;
          font-size: 0.85rem;
        }
        @media (max-width: 768px) {
          .admin-gallery-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 0.75rem;
          }
        }
      `}} />
    </div>
  );
};

// ============================================================
// TESTIMONIALS MANAGER - No localStorage
// ============================================================
const TestimonialsManager = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [formData, setFormData] = useState({ name: '', title: '', parentType: '', section: '', quote: '', rating: 5 });
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [saving, setSaving] = useState(false);

  const loadTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTestimonials();
      setTestimonials(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading testimonials:', error);
      setAlert({ show: true, type: 'danger', message: 'Failed to load testimonials.' });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSaveTestimonial = async () => {
    if (!formData.name || !formData.quote) {
      setAlert({ show: true, type: 'danger', message: 'Please fill in name and quote.' });
      setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
      return;
    }

    setSaving(true);
    try {
      const testimonialData = {
        name: formData.name,
        title: formData.title || 'Mr.',
        parentType: formData.parentType || '',
        section: formData.section || '',
        quote: formData.quote,
        rating: parseInt(formData.rating) || 5
      };

      let result;
      if (editingTestimonial) {
        result = await updateTestimonial(editingTestimonial.id, testimonialData);
      } else {
        result = await addTestimonial(testimonialData);
      }

      if (result) {
        await loadTestimonials();
        handleCloseModal();
        setAlert({ 
          show: true, 
          type: 'success', 
          message: `Testimonial ${editingTestimonial ? 'updated' : 'added'} successfully!` 
        });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
      }
    } catch (error) {
      console.error('Error saving testimonial:', error);
      setAlert({ show: true, type: 'danger', message: 'Failed to save testimonial: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    
    try {
      const result = await deleteTestimonial(id);
      if (result) {
        await loadTestimonials();
        setAlert({ show: true, type: 'success', message: 'Testimonial deleted successfully!' });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      setAlert({ show: true, type: 'danger', message: 'Failed to delete testimonial.' });
    }
  };

  const handleOpenModal = (testimonial = null) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setFormData({
        name: testimonial.name || '',
        title: testimonial.title || 'Mr.',
        parentType: testimonial.parentType || '',
        section: testimonial.section || '',
        quote: testimonial.quote || '',
        rating: testimonial.rating || 5
      });
    } else {
      setEditingTestimonial(null);
      setFormData({ name: '', title: 'Mr.', parentType: '', section: '', quote: '', rating: 5 });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTestimonial(null);
    setFormData({ name: '', title: 'Mr.', parentType: '', section: '', quote: '', rating: 5 });
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="h5 fw-bold mb-0">Manage Testimonials ({testimonials.length})</h3>
        <Button className="btn-navy" size="sm" onClick={() => handleOpenModal()}>
          <i className="fas fa-plus me-1"></i> Add New Testimonial
        </Button>
      </div>
      {alert.show && <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false })} className="mb-3">{alert.message}</Alert>}
      <div className="admin-table-wrapper">
        <Table responsive hover className="admin-table">
          <thead><tr><th>ID</th><th>Name</th><th>Parent Type</th><th>Rating</th><th>Quote</th><th>Actions</th></tr></thead>
          <tbody>
            {testimonials.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-muted py-4">
                  No testimonials found. Click "Add New Testimonial" to create one.
                </td>
              </tr>
            ) : (
              testimonials.map(t => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td className="fw-semibold">{t.title} {t.name}</td>
                  <td>{t.parentType}</td>
                  <td>{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</td>
                  <td className="text-truncate" style={{ maxWidth: '300px' }}>{t.quote?.substring(0, 80)}...</td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleOpenModal(t)}><i className="fas fa-edit"></i></Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteTestimonial(t.id)}><i className="fas fa-trash"></i></Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton><Modal.Title>{editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}</Modal.Title></Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <Form>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Title</Form.Label>
                  <Form.Select name="title" value={formData.title} onChange={handleFormChange}>
                    <option>Mr.</option><option>Mrs.</option><option>Ms.</option><option>Dr.</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Full Name *</Form.Label>
                  <Form.Control type="text" name="name" value={formData.name} onChange={handleFormChange} />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Parent Type</Form.Label>
                  <Form.Control type="text" name="parentType" value={formData.parentType} onChange={handleFormChange} placeholder="e.g., ECD Parent" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Section</Form.Label>
                  <Form.Control type="text" name="section" value={formData.section} onChange={handleFormChange} placeholder="e.g., Primary School" />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Rating</Form.Label>
              <Form.Select name="rating" value={formData.rating} onChange={handleFormChange}>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Quote *</Form.Label>
              <Form.Control as="textarea" rows={4} name="quote" value={formData.quote} onChange={handleFormChange} placeholder="Parent testimonial quote..." />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal} disabled={saving}>Cancel</Button>
          <Button className="btn-navy" onClick={handleSaveTestimonial} disabled={saving}>
            {saving ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                {editingTestimonial ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              editingTestimonial ? 'Update Testimonial' : 'Save Testimonial'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

// ============================================================
// FAQ MANAGER - No localStorage
// ============================================================
const FAQManager = () => {
  const [faqCategories, setFaqCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({ question: '', answer: '', category: '' });
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [saving, setSaving] = useState(false);

  const categoriesList = [
    { id: "Admissions", name: "Admissions", icon: "📋", color: "#4299e1" },
    { id: "Academics & Co-curricular", name: "Academics & Co-curricular", icon: "🏆", color: "#48bb78" },
    { id: "Boarding & Student Life", name: "Boarding & Student Life", icon: "🏡", color: "#9f7aea" },
    { id: "Fees & Payments", name: "Fees & Payments", icon: "💰", color: "#f56565" },
    { id: "School Transport", name: "School Transport", icon: "🚌", color: "#ed8936" },
  ];

  const loadFAQ = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFAQ();
      if (data && data.length > 0) {
        setFaqCategories(data);
      } else {
        setFaqCategories([]);
      }
    } catch (error) {
      console.error('Error loading FAQ:', error);
      setAlert({ show: true, type: 'danger', message: 'Failed to load FAQ.' });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSaveFAQ = async () => {
    if (!formData.question || !formData.answer) {
      setAlert({ show: true, type: 'danger', message: 'Please fill in both question and answer.' });
      setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
      return;
    }

    setSaving(true);
    try {
      let newFaq = [...faqCategories];
      let catIndex = newFaq.findIndex(c => c.category === formData.category);
      
      if (catIndex === -1) {
        const catInfo = categoriesList.find(c => c.id === formData.category);
        newFaq.push({
          category: formData.category,
          icon: catInfo?.icon || "📋",
          color: catInfo?.color || "#4299e1",
          questions: []
        });
        catIndex = newFaq.length - 1;
      }

      if (editingItem) {
        const qIndex = newFaq[catIndex].questions.findIndex(q => q.id === editingItem.id);
        if (qIndex !== -1) {
          newFaq[catIndex].questions[qIndex] = {
            ...editingItem,
            question: formData.question,
            answer: formData.answer
          };
        }
      } else {
        const allIds = newFaq.flatMap(c => c.questions.map(q => q.id));
        const newId = allIds.length > 0 ? Math.max(...allIds) + 1 : 1;
        newFaq[catIndex].questions.push({
          id: newId,
          question: formData.question,
          answer: formData.answer
        });
      }

      const result = await saveFAQ(newFaq);
      if (result) {
        await loadFAQ();
        handleCloseModal();
        setAlert({
          show: true,
          type: 'success',
          message: `FAQ ${editingItem ? 'updated' : 'added'} successfully!`
        });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
      setAlert({ show: true, type: 'danger', message: 'Failed to save FAQ: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFAQ = async (category, id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const newFaq = faqCategories.map(cat =>
        cat.category === category
          ? { ...cat, questions: cat.questions.filter(q => q.id !== id) }
          : cat
      ).filter(cat => cat.questions.length > 0);

      const result = await saveFAQ(newFaq);
      if (result) {
        await loadFAQ();
        setAlert({ show: true, type: 'success', message: 'FAQ deleted successfully!' });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      setAlert({ show: true, type: 'danger', message: 'Failed to delete FAQ.' });
    }
  };

  const handleOpenModal = (item = null, category = '') => {
    if (item) {
      setEditingItem(item);
      setFormData({
        question: item.question || '',
        answer: item.answer || '',
        category: item.category || category
      });
    } else {
      setEditingItem(null);
      setFormData({
        question: '',
        answer: '',
        category: category || categoriesList[0].id
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ question: '', answer: '', category: '' });
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    loadFAQ();
  }, [loadFAQ]);

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;
  }

  const totalQuestions = faqCategories.reduce((acc, cat) => acc + (cat.questions?.length || 0), 0);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h3 className="h5 fw-bold mb-0">Manage FAQs ({totalQuestions} questions)</h3>
        <div className="d-flex gap-2">
          <Form.Select size="sm" style={{ width: '200px' }} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categoriesList.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </Form.Select>
          <Button className="btn-navy" size="sm" onClick={() => handleOpenModal(null, selectedCategory)}>
            <i className="fas fa-plus me-1"></i> Add FAQ
          </Button>
        </div>
      </div>

      {alert.show && <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false })} className="mb-3">{alert.message}</Alert>}

      {faqCategories.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-3 shadow-sm">
          <p className="text-muted">No FAQ categories available. Add a new FAQ to get started.</p>
        </div>
      ) : (
        faqCategories.map((category, catIndex) => (
          <div key={catIndex} className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <span style={{ fontSize: '1.2rem' }}>{category.icon || "📋"}</span>
                <h4 className="h6 fw-bold mb-0">{category.category}</h4>
                <span className="badge" style={{ backgroundColor: category.color || "#4299e1", color: 'white' }}>
                  {category.questions?.length || 0} questions
                </span>
              </div>
            </div>
            <div className="admin-table-wrapper">
              <Table responsive hover className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '5%' }}>#</th>
                    <th style={{ width: '35%' }}>Question</th>
                    <th style={{ width: '50%' }}>Answer (HTML supported)</th>
                    <th style={{ width: '10%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {category.questions && category.questions.map((q, idx) => (
                    <tr key={q.id}>
                      <td>{idx + 1}</td>
                      <td className="fw-semibold">{q.question}</td>
                      <td>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: q.answer.length > 150
                              ? q.answer.substring(0, 150) + '...'
                              : q.answer
                          }}
                          style={{ fontSize: '0.85rem' }}
                        />
                      </td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleOpenModal(q, category.category)}>
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDeleteFAQ(category.category, q.id)}>
                          <i className="fas fa-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {(!category.questions || category.questions.length === 0) && (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-3">
                        No FAQs in this category. Click "Add FAQ" to add one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        ))
      )}

      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingItem ? 'Edit FAQ' : 'Add New FAQ'}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Category *</Form.Label>
              <Form.Select name="category" value={formData.category} onChange={handleFormChange}>
                {categoriesList.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Question *</Form.Label>
              <Form.Control
                type="text"
                name="question"
                value={formData.question}
                onChange={handleFormChange}
                placeholder="Enter the question here..."
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Answer *</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                name="answer"
                value={formData.answer}
                onChange={handleFormChange}
                placeholder="Enter the answer here. You can use HTML tags like &lt;br&gt;, &lt;strong&gt;, &lt;a href=&quot;/path&quot;&gt;link&lt;/a&gt;"
              />
              <Form.Text className="text-muted">
                <small>HTML supported: &lt;br&gt; for line breaks, &lt;strong&gt; for bold, &lt;a href=&quot;/path&quot;&gt; for links</small>
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal} disabled={saving}>Cancel</Button>
          <Button className="btn-navy" onClick={handleSaveFAQ} disabled={saving}>
            {saving ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                {editingItem ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              editingItem ? 'Update FAQ' : 'Save FAQ'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

// ============================================================
// PARTNERS MANAGER - No localStorage
// ============================================================
const PartnersManager = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [formData, setFormData] = useState({ name: '', logo: '', website: '', description: '' });
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [saving, setSaving] = useState(false);

  const loadPartners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPartners();
      setPartners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading partners:', error);
      setAlert({ show: true, type: 'danger', message: 'Failed to load partners.' });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSavePartner = async () => {
    if (!formData.name) {
      setAlert({ show: true, type: 'danger', message: 'Please enter partner name.' });
      setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
      return;
    }

    setSaving(true);
    try {
      const partnerData = {
        name: formData.name,
        logo: formData.logo || '',
        website: formData.website || '',
        description: formData.description || ''
      };

      let result;
      if (editingPartner) {
        result = await updatePartner(editingPartner.id, partnerData);
      } else {
        result = await addPartner(partnerData);
      }

      if (result) {
        await loadPartners();
        handleCloseModal();
        setAlert({
          show: true,
          type: 'success',
          message: `Partner ${editingPartner ? 'updated' : 'added'} successfully!`
        });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
      }
    } catch (error) {
      console.error('Error saving partner:', error);
      setAlert({ show: true, type: 'danger', message: 'Failed to save partner: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePartner = async (id) => {
    if (!window.confirm('Are you sure you want to delete this partner?')) return;

    try {
      const result = await deletePartner(id);
      if (result) {
        await loadPartners();
        setAlert({ show: true, type: 'success', message: 'Partner deleted successfully!' });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
      }
    } catch (error) {
      console.error('Error deleting partner:', error);
      setAlert({ show: true, type: 'danger', message: 'Failed to delete partner.' });
    }
  };

  const handleOpenModal = (partner = null) => {
    if (partner) {
      setEditingPartner(partner);
      setFormData({
        name: partner.name || '',
        logo: partner.logo || '',
        website: partner.website || '',
        description: partner.description || ''
      });
    } else {
      setEditingPartner(null);
      setFormData({ name: '', logo: '', website: '', description: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPartner(null);
    setFormData({ name: '', logo: '', website: '', description: '' });
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    loadPartners();
  }, [loadPartners]);

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="h5 fw-bold mb-0">Manage Partners & Sponsors ({partners.length})</h3>
        <Button className="btn-navy" size="sm" onClick={() => handleOpenModal()}>
          <i className="fas fa-plus me-1"></i> Add Partner
        </Button>
      </div>
      {alert.show && <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false })} className="mb-3">{alert.message}</Alert>}
      <div className="admin-table-wrapper">
        <Table responsive hover className="admin-table">
          <thead><tr><th>ID</th><th>Name</th><th>Description</th><th>Website</th><th>Actions</th></tr></thead>
          <tbody>
            {partners.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted py-4">
                  No partners found. Click "Add Partner" to add one.
                </td>
              </tr>
            ) : (
              partners.map(partner => (
                <tr key={partner.id}>
                  <td>{partner.id}</td>
                  <td className="fw-semibold">{partner.name}</td>
                  <td className="text-truncate" style={{ maxWidth: '300px' }}>{partner.description?.substring(0, 80)}...</td>
                  <td>{partner.website && <a href={partner.website} target="_blank" rel="noopener noreferrer">Link</a>}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleOpenModal(partner)}><i className="fas fa-edit"></i></Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDeletePartner(partner.id)}><i className="fas fa-trash"></i></Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton><Modal.Title>{editingPartner ? 'Edit Partner' : 'Add New Partner'}</Modal.Title></Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Partner Name *</Form.Label>
              <Form.Control type="text" name="name" value={formData.name} onChange={handleFormChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Logo URL</Form.Label>
              <Form.Control type="text" name="logo" value={formData.logo} onChange={handleFormChange} placeholder="/images/partners/..." />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Website</Form.Label>
              <Form.Control type="url" name="website" value={formData.website} onChange={handleFormChange} placeholder="https://..." />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Description</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleFormChange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal} disabled={saving}>Cancel</Button>
          <Button className="btn-navy" onClick={handleSavePartner} disabled={saving}>
            {saving ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                {editingPartner ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              editingPartner ? 'Update Partner' : 'Save Partner'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

// ============================================================
// FEE STRUCTURE MANAGER - No localStorage
// ============================================================
const FeeStructureManager = () => {
  const [loading, setLoading] = useState(true);
  const [feeData, setFeeData] = useState({
    ecde: { image: '', label: 'ECDE Fee Structure' },
    primary: { image: '', label: 'Primary Fee Structure' },
    junior: { image: '', label: 'Junior Secondary Fee Structure' },
    transport: { image: '', label: 'Transport Costs' }
  });
  const [editingKey, setEditingKey] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [saving, setSaving] = useState(false);

  const defaultImages = {
    ecde: '/images/fee-structure/ecde.jpg',
    primary: '/images/fee-structure/primary.jpg',
    junior: '/images/fee-structure/junior.jpg',
    transport: '/images/fee-structure/transport.jpg'
  };

  const feeOptions = [
    { key: 'ecde', label: 'ECDE Fee Structure', icon: 'fas fa-child' },
    { key: 'primary', label: 'Primary Fee Structure', icon: 'fas fa-user-graduate' },
    { key: 'junior', label: 'Junior Secondary Fee Structure', icon: 'fas fa-school' },
    { key: 'transport', label: 'Transport Costs', icon: 'fas fa-bus' }
  ];

  const loadFeeData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFeeStructure();
      if (data) {
        setFeeData({
          ecde: { image: data.ecde?.image || defaultImages.ecde, label: data.ecde?.label || 'ECDE Fee Structure' },
          primary: { image: data.primary?.image || defaultImages.primary, label: data.primary?.label || 'Primary Fee Structure' },
          junior: { image: data.junior?.image || defaultImages.junior, label: data.junior?.label || 'Junior Secondary Fee Structure' },
          transport: { image: data.transport?.image || defaultImages.transport, label: data.transport?.label || 'Transport Costs' }
        });
      } else {
        setFeeData({
          ecde: { image: defaultImages.ecde, label: 'ECDE Fee Structure' },
          primary: { image: defaultImages.primary, label: 'Primary Fee Structure' },
          junior: { image: defaultImages.junior, label: 'Junior Secondary Fee Structure' },
          transport: { image: defaultImages.transport, label: 'Transport Costs' }
        });
      }
    } catch (error) {
      console.error('Error loading fee structure:', error);
      setFeeData({
        ecde: { image: defaultImages.ecde, label: 'ECDE Fee Structure' },
        primary: { image: defaultImages.primary, label: 'Primary Fee Structure' },
        junior: { image: defaultImages.junior, label: 'Junior Secondary Fee Structure' },
        transport: { image: defaultImages.transport, label: 'Transport Costs' }
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const saveFeeData = async (newData) => {
    setSaving(true);
    try {
      const result = await saveFeeStructure(newData);
      if (result) {
        setFeeData(newData);
        setAlert({ show: true, type: 'success', message: 'Fee structure saved successfully!' });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
      }
    } catch (error) {
      console.error('Error saving fee structure:', error);
      setAlert({ show: true, type: 'danger', message: 'Failed to save fee structure: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (imageUrl, displayUrl, filename, deleteUrl) => {
    setImageUrl(imageUrl);
    if (editingKey) {
      const updatedData = {
        ...feeData,
        [editingKey]: {
          ...feeData[editingKey],
          image: imageUrl
        }
      };
      saveFeeData(updatedData);
      setEditingKey(null);
      setImageUrl(null);
    }
  };

  const handleEdit = (key) => {
    setEditingKey(key);
    const currentImage = feeData[key]?.image || defaultImages[key];
    setImageUrl(currentImage);
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setImageUrl(null);
  };

  const handleReset = () => {
    if (window.confirm('Reset all fee structure images to default? This will remove all custom uploaded images.')) {
      const defaults = {
        ecde: { image: defaultImages.ecde, label: 'ECDE Fee Structure' },
        primary: { image: defaultImages.primary, label: 'Primary Fee Structure' },
        junior: { image: defaultImages.junior, label: 'Junior Secondary Fee Structure' },
        transport: { image: defaultImages.transport, label: 'Transport Costs' }
      };
      saveFeeData(defaults);
    }
  };

  const handleResetIndividual = (key) => {
    if (window.confirm(`Reset ${feeData[key]?.label || key} to default image?`)) {
      const updatedData = {
        ...feeData,
        [key]: {
          ...feeData[key],
          image: defaultImages[key]
        }
      };
      saveFeeData(updatedData);
      setEditingKey(null);
      setImageUrl(null);
    }
  };

  const getImageSrc = (key) => {
    const data = feeData[key];
    if (!data) return defaultImages[key];
    return data.image || defaultImages[key];
  };

  useEffect(() => {
    loadFeeData();
  }, [loadFeeData]);

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="h5 fw-bold mb-0">Manage Fee Structure Images</h3>
        <Button variant="outline-danger" size="sm" onClick={handleReset} disabled={saving}>
          <i className="fas fa-undo me-1"></i> Reset All to Default
        </Button>
      </div>

      {alert.show && <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false })} className="mb-3">{alert.message}</Alert>}

      <Row className="g-4">
        {feeOptions.map((option) => {
          const data = feeData[option.key] || {};
          const isEditing = editingKey === option.key;
          const imageSrc = getImageSrc(option.key);
          const isDefault = data.image === defaultImages[option.key] || !data.image;

          return (
            <Col key={option.key} md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <i className={option.icon} style={{ color: '#050265' }}></i>
                      <h4 className="h6 fw-bold mb-0">{option.label}</h4>
                      {isDefault && (
                        <span className="badge bg-secondary" style={{ fontSize: '0.6rem' }}>Default</span>
                      )}
                    </div>
                    {isEditing ? (
                      <div>
                        <Button variant="outline-secondary" size="sm" className="me-1" onClick={handleCancelEdit} disabled={saving}>
                          <i className="fas fa-times"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="me-1"
                          onClick={() => handleResetIndividual(option.key)}
                          disabled={saving}
                          title="Reset to default image"
                        >
                          <i className="fas fa-undo"></i>
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline-primary" size="sm" onClick={() => handleEdit(option.key)} disabled={saving}>
                        <i className="fas fa-edit"></i> Update Image
                      </Button>
                    )}
                  </div>

                  <div
                    style={{
                      width: '100%',
                      height: '200px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      position: 'relative',
                      backgroundColor: '#f5f7fb',
                      border: '1px solid #e9ecef'
                    }}
                  >
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={option.label}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          padding: '0.5rem'
                        }}
                        onError={(e) => {
                          e.target.src = defaultImages[option.key];
                        }}
                      />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                        <div className="text-center">
                          <i className="fas fa-image fa-2x mb-2" style={{ opacity: 0.3 }}></i>
                          <p className="small mb-0">No image uploaded</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="mt-3">
                      <ImageUploader
                        onImageUpload={handleImageUpload}
                        currentImage={imageUrl}
                        label={`Upload new image for ${option.label}`}
                        maxSize={5}
                      />
                    </div>
                  )}

                  <div className="mt-2 d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      {isDefault ? 'Using default image' : 'Using custom uploaded image'}
                    </small>
                    {isEditing && (
                      <small className="text-primary">
                        <i className="fas fa-info-circle me-1"></i>
                        Upload a new image above
                      </small>
                    )}
                  </div>

                  <div className="mt-1">
                    <small className="text-muted" style={{ fontSize: '0.65rem', wordBreak: 'break-all' }}>
                      {feeData[option.key]?.image || defaultImages[option.key]}
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Card className="border-0 shadow-sm mt-4">
        <Card.Body>
          <h5 className="h6 fw-bold mb-2">
            <i className="fas fa-info-circle me-2 text-primary"></i>
            How to Update Fee Structure Images
          </h5>
          <ol className="small text-muted mb-0" style={{ paddingLeft: '1.5rem' }}>
            <li>Click <strong>"Update Image"</strong> on the fee structure you want to change</li>
            <li>Use the <strong>Image Uploader</strong> to select a new image</li>
            <li>Image will be uploaded to ImgBB and saved automatically</li>
            <li>Use <strong>"Reset to Default"</strong> to restore the original image</li>
          </ol>
        </Card.Body>
      </Card>
    </div>
  );
};

// ============================================================
// PAGES CONTENT MANAGER - No localStorage
// ============================================================
const PagesManager = () => {
  const [pageContent, setPageContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState(null);
  const [formData, setFormData] = useState({});
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [activeCategory, setActiveCategory] = useState('homepage');
  const [saving, setSaving] = useState(false);

  // Complete page definitions
  const pageDefinitions = {
    homepage: {
      name: 'Homepage',
      icon: 'fas fa-home',
      sections: [
        { id: 'hero', name: 'Hero Section', fields: ['title', 'subtitle'] },
        { id: 'about', name: 'About Section', fields: ['title', 'content'] },
        { id: 'why_choose_us', name: 'Why Choose Us', fields: ['title', 'intro', 'items'] },
      ]
    },
    about: {
      name: 'About Us',
      icon: 'fas fa-info-circle',
      sections: [
        { id: 'hero', name: 'Hero Section', fields: ['title', 'subtitle'] },
        { id: 'content', name: 'Content Section', fields: ['title', 'content', 'mission', 'vision', 'values'] },
      ]
    },
    academics: {
      name: 'Academics',
      icon: 'fas fa-graduation-cap',
      sections: [
        { id: 'hero', name: 'Hero Section', fields: ['title', 'subtitle'] },
        { id: 'content', name: 'Content Section', fields: ['title', 'content'] },
      ]
    },
    curriculum: {
      name: 'Curriculum',
      icon: 'fas fa-book-open',
      sections: [
        { id: 'hero', name: 'Hero Section', fields: ['title', 'subtitle'] },
        { id: 'content', name: 'Content Section', fields: ['title', 'content'] },
      ]
    },
    clubs: {
      name: 'Clubs & Societies',
      icon: 'fas fa-users',
      sections: [
        { id: 'hero', name: 'Hero Section', fields: ['title', 'subtitle'] },
        { id: 'content', name: 'Content Section', fields: ['title', 'content'] },
      ]
    },
    boarding: {
      name: 'Boarding Life',
      icon: 'fas fa-bed',
      sections: [
        { id: 'hero', name: 'Hero Section', fields: ['title', 'subtitle'] },
        { id: 'overview', name: 'Overview Section', fields: ['title', 'content'] },
        { id: 'experience', name: 'Experience Section', fields: ['title', 'content'] },
        { id: 'study', name: 'Study Section', fields: ['title', 'content'] },
        { id: 'recreation', name: 'Recreation Section', fields: ['title', 'content'] },
        { id: 'parent_expectations', name: 'Parent Expectations', fields: ['title', 'content'] },
        { id: 'outcomes', name: 'Outcomes Section', fields: ['title', 'content'] },
        { id: 'routine', name: 'Daily Routine', fields: ['title', 'content'] },
        { id: 'checklist', name: 'Boarding Checklist', fields: ['title', 'content'] },
      ]
    },
    dining: {
      name: 'Dining',
      icon: 'fas fa-utensils',
      sections: [
        { id: 'hero', name: 'Hero Section', fields: ['title', 'subtitle'] },
        { id: 'content', name: 'Content Section', fields: ['title', 'content'] },
      ]
    },
    gallery: {
      name: 'Gallery',
      icon: 'fas fa-images',
      sections: [
        { id: 'hero', name: 'Hero Section', fields: ['title', 'subtitle'] },
        { id: 'content', name: 'Content Section', fields: ['title', 'content'] },
      ]
    },
    faq: {
      name: 'FAQ',
      icon: 'fas fa-question-circle',
      sections: [
        { id: 'hero', name: 'Hero Section', fields: ['title', 'subtitle'] },
        { id: 'content', name: 'Content Section', fields: ['title', 'content'] },
      ]
    },
    fee_structure: {
      name: 'Fee Structure',
      icon: 'fas fa-money-bill-wave',
      sections: [
        { id: 'hero', name: 'Hero Section', fields: ['title', 'subtitle'] },
        { id: 'content', name: 'Content Section', fields: ['title', 'content'] },
      ]
    },
    apply: {
      name: 'Apply',
      icon: 'fas fa-file-alt',
      sections: [
        { id: 'hero', name: 'Hero Section', fields: ['title', 'subtitle'] },
        { id: 'content', name: 'Content Section', fields: ['title', 'content'] },
      ]
    },
    contact: {
      name: 'Contact',
      icon: 'fas fa-envelope',
      sections: [
        { id: 'hero', name: 'Hero Section', fields: ['title', 'subtitle'] },
        { id: 'content', name: 'Content Section', fields: ['title', 'content'] },
      ]
    },
    partner: {
      name: 'Partners',
      icon: 'fas fa-handshake',
      sections: [
        { id: 'hero', name: 'Hero Section', fields: ['title', 'subtitle'] },
        { id: 'content', name: 'Content Section', fields: ['title', 'content'] },
      ]
    },
    blog: {
      name: 'Blog',
      icon: 'fas fa-newspaper',
      sections: [
        { id: 'hero', name: 'Hero Section', fields: ['title', 'subtitle'] },
        { id: 'content', name: 'Content Section', fields: ['title', 'content'] },
      ]
    },
    privacy_policy: {
      name: 'Privacy Policy',
      icon: 'fas fa-shield-alt',
      sections: [
        { id: 'hero', name: 'Hero Section', fields: ['title', 'subtitle'] },
        { id: 'content', name: 'Content Section', fields: ['title', 'content'] },
      ]
    },
    terms: {
      name: 'Terms of Service',
      icon: 'fas fa-file-contract',
      sections: [
        { id: 'hero', name: 'Hero Section', fields: ['title', 'subtitle'] },
        { id: 'content', name: 'Content Section', fields: ['title', 'content'] },
      ]
    },
  };

  const pageCategories = [
    { id: 'homepage', label: 'Homepage', icon: 'fas fa-home' },
    { id: 'about', label: 'About', icon: 'fas fa-info-circle' },
    { id: 'academics', label: 'Academics', icon: 'fas fa-graduation-cap' },
    { id: 'curriculum', label: 'Curriculum', icon: 'fas fa-book-open' },
    { id: 'clubs', label: 'Clubs & Societies', icon: 'fas fa-users' },
    { id: 'boarding', label: 'Boarding Life', icon: 'fas fa-bed' },
    { id: 'dining', label: 'Dining', icon: 'fas fa-utensils' },
    { id: 'gallery', label: 'Gallery', icon: 'fas fa-images' },
    { id: 'faq', label: 'FAQ', icon: 'fas fa-question-circle' },
    { id: 'fee_structure', label: 'Fee Structure', icon: 'fas fa-money-bill-wave' },
    { id: 'apply', label: 'Apply', icon: 'fas fa-file-alt' },
    { id: 'contact', label: 'Contact', icon: 'fas fa-envelope' },
    { id: 'partner', label: 'Partners', icon: 'fas fa-handshake' },
    { id: 'blog', label: 'Blog', icon: 'fas fa-newspaper' },
    { id: 'privacy_policy', label: 'Privacy Policy', icon: 'fas fa-shield-alt' },
    { id: 'terms', label: 'Terms of Service', icon: 'fas fa-file-contract' },
  ];

  const loadPageContent = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPageContent();
      if (data) {
        setPageContent(data);
      } else {
        setPageContent({});
      }
    } catch (error) {
      console.error('Error loading page content:', error);
      setAlert({ show: true, type: 'danger', message: 'Failed to load page content.' });
    } finally {
      setLoading(false);
    }
  }, []);

  const savePageContentToJsonBin = async (newContent) => {
    setSaving(true);
    try {
      const result = await savePageContent(newContent);
      if (result) {
        setPageContent(newContent);
        setAlert({ show: true, type: 'success', message: 'Page content updated successfully!' });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
      }
    } catch (error) {
      console.error('Error saving page content:', error);
      setAlert({ show: true, type: 'danger', message: 'Failed to save page content: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  const getDefaultContent = (pageKey, sectionId, field) => {
    const defaults = {
      homepage: {
        hero: { title: 'Give Your Child the Foundation to Lead', subtitle: 'Excellence in CBE education, grounded in Christian values and the warmth of the Kenyan spirit.' },
        about: { title: 'Are you looking for a school where your child will be known, nurtured, and inspired to succeed?', content: 'At Kitale Progressive School, we believe every child carries unique potential. Our learning environment is designed to nurture curiosity, strengthen character, and build a strong academic foundation that prepares learners for the future.' },
        why_choose_us: { title: 'Why Parents Choose Kitale Progressive School', intro: 'Parents choose Kitale Progressive School because we combine strong academic excellence with a nurturing and supportive environment.', items: [] }
      },
      about: {
        hero: { title: 'About Kitale Progressive School', subtitle: 'Learn about our history, mission, and values.' },
        content: { title: 'Our Story', content: 'Kitale Progressive School was founded with a vision to provide quality education...', mission: 'To provide quality education that nurtures every child\'s potential.', vision: 'To be a leading institution in holistic education.', values: 'Excellence, Integrity, Discipline, Compassion' }
      },
      academics: {
        hero: { title: 'Academics at Kitale Progressive School', subtitle: 'A comprehensive approach to learning and development.' },
        content: { title: 'Our Academic Programs', content: 'We offer a comprehensive academic program that prepares learners for success.' }
      },
      curriculum: {
        hero: { title: 'Our Curriculum', subtitle: 'Competency-Based Education (CBE) approved by KICD.' },
        content: { title: 'Curriculum Overview', content: 'Our curriculum focuses on developing practical skills, creativity, and critical thinking.' }
      },
      clubs: {
        hero: { title: 'Clubs & Societies', subtitle: 'Discover your passion and develop new skills.' },
        content: { title: 'Co-Curricular Activities', content: 'We offer a wide range of clubs and societies to develop talents and interests.' }
      },
      boarding: {
        hero: { title: 'A Safe and Structured Boarding Experience', subtitle: 'Our boarding program provides a structured, disciplined and supportive environment.' },
        overview: { title: 'What Your Child Will Experience', content: 'Every day in our boarding program is designed to support academic success and personal growth.' },
        experience: { title: 'Comfortable Living Spaces', content: 'Our dormitories are thoughtfully designed to be a true home away from home.' },
        study: { title: 'Supervised Study Time', content: 'Evening prep sessions are supervised by qualified teachers.' },
        recreation: { title: 'Recreation & Wellness', content: 'We believe in holistic development.' },
        parent_expectations: { title: 'What to Expect as a Parent', content: '' },
        outcomes: { title: 'Learners Develop', content: '' },
        routine: { title: 'Daily Routine for Boarders', content: '' },
        checklist: { title: 'Boarding Checklist', content: 'Essential Items Your Child will need for Boarding' }
      },
      dining: {
        hero: { title: 'Nutritious Meals Every Day', subtitle: 'Balanced, healthy meals prepared with care.' },
        content: { title: 'Dining at KPS', content: 'We provide nutritious meals to support your child\'s health and learning.' }
      },
      gallery: {
        hero: { title: 'Our Gallery', subtitle: 'A glimpse into daily life at Kitale Progressive School.' },
        content: { title: 'School Life', content: 'Explore our school through photos and videos.' }
      },
      faq: {
        hero: { title: 'Frequently Asked Questions', subtitle: 'Find answers to your questions.' },
        content: { title: 'FAQ', content: 'Find answers to common questions about our school.' }
      },
      fee_structure: {
        hero: { title: 'Clear, Flexible, and Value-Driven School Fees', subtitle: 'Transparent and manageable fee structure.' },
        content: { title: 'Fee Structure', content: 'Our fee structure is designed to balance affordability with quality education.' }
      },
      apply: {
        hero: { title: 'Apply Now', subtitle: 'Start your child\'s journey at Kitale Progressive School.' },
        content: { title: 'Application Process', content: 'Complete the application form to begin the admissions process.' }
      },
      contact: {
        hero: { title: 'Get In Touch', subtitle: 'We\'re here to answer your questions.' },
        content: { title: 'Contact Us', content: 'Reach out to us for any inquiries.' }
      },
      partner: {
        hero: { title: 'Partner With Us', subtitle: 'Collaborate with us to expand access to quality education.' },
        content: { title: 'Partnership Opportunities', content: 'We welcome partners who share our vision.' }
      },
      blog: {
        hero: { title: 'Blog', subtitle: 'Insights and stories from Kitale Progressive School.' },
        content: { title: 'Latest Posts', content: 'Stay updated with our latest articles and news.' }
      },
      privacy_policy: {
        hero: { title: 'Privacy Policy', subtitle: 'How we protect and handle your information.' },
        content: { title: 'Privacy Policy', content: 'Read our privacy policy to understand how we handle your data.' }
      },
      terms: {
        hero: { title: 'Terms of Service', subtitle: 'Please read these terms carefully.' },
        content: { title: 'Terms of Service', content: 'Read our terms of service.' }
      },
    };
    return defaults[pageKey]?.[sectionId]?.[field] || '';
  };

  const handleEditSection = (pageKey, sectionId) => {
    setEditingPage({ pageKey, sectionId });
    const content = pageContent[pageKey]?.[sectionId] || {};
    setFormData({ ...content });
  };

  const handleSaveContent = () => {
    const { pageKey, sectionId } = editingPage;
    const updatedContent = { ...pageContent };
    if (!updatedContent[pageKey]) updatedContent[pageKey] = {};
    updatedContent[pageKey][sectionId] = { ...formData };
    savePageContentToJsonBin(updatedContent);
    setEditingPage(null);
    setFormData({});
  };

  const handleCancelEdit = () => {
    setEditingPage(null);
    setFormData({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleResetPage = (pageKey) => {
    if (window.confirm(`Reset all content for "${pageDefinitions[pageKey]?.name || pageKey}" to default?`)) {
      const updatedContent = { ...pageContent };
      updatedContent[pageKey] = {};
      pageDefinitions[pageKey].sections.forEach(section => {
        updatedContent[pageKey][section.id] = {};
        section.fields.forEach(field => {
          updatedContent[pageKey][section.id][field] = getDefaultContent(pageKey, section.id, field);
        });
      });
      savePageContentToJsonBin(updatedContent);
    }
  };

  useEffect(() => {
    loadPageContent();
  }, [loadPageContent]);

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;
  }

  const currentPage = pageDefinitions[activeCategory];
  const currentPageContent = pageContent[activeCategory] || {};

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="h5 fw-bold mb-0">Manage Page Content</h3>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-danger" 
            size="sm" 
            onClick={() => handleResetPage(activeCategory)}
            disabled={saving}
          >
            <i className="fas fa-undo me-1"></i> Reset This Page
          </Button>
        </div>
      </div>

      {alert.show && <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false })} className="mb-3">{alert.message}</Alert>}

      <div className="mb-4" style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '0.5rem',
        padding: '0.5rem',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        {pageCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id); setEditingPage(null); setFormData({}); }}
            className={`page-category-btn ${activeCategory === cat.id ? 'active' : ''}`}
            style={{
              padding: '0.4rem 1rem',
              borderRadius: '40px',
              border: 'none',
              background: activeCategory === cat.id ? 'var(--gradient-primary)' : 'transparent',
              color: activeCategory === cat.id ? 'white' : '#050265',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <i className={cat.icon} style={{ fontSize: '0.8rem' }}></i>
            {cat.label}
          </button>
        ))}
      </div>

      {currentPage && (
        <div>
          <h4 className="h6 fw-bold mb-3">
            <i className={currentPage.icon + ' me-2'}></i>
            {currentPage.name}
          </h4>

          <Row className="g-4">
            {currentPage.sections.map((section) => {
              const isEditing = editingPage?.pageKey === activeCategory && editingPage?.sectionId === section.id;
              const sectionContent = currentPageContent[section.id] || {};

              return (
                <Col key={section.id} md={6} lg={4}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="h6 fw-bold mb-0">{section.name}</h5>
                        {isEditing ? (
                          <div>
                            <Button variant="outline-secondary" size="sm" className="me-1" onClick={handleCancelEdit} disabled={saving}>
                              <i className="fas fa-times"></i>
                            </Button>
                            <Button variant="primary" size="sm" onClick={handleSaveContent} disabled={saving}>
                              <i className="fas fa-save"></i>
                            </Button>
                          </div>
                        ) : (
                          <Button variant="outline-primary" size="sm" onClick={() => handleEditSection(activeCategory, section.id)}>
                            <i className="fas fa-edit"></i> Edit
                          </Button>
                        )}
                      </div>

                      {isEditing ? (
                        <>
                          {section.fields.map(field => (
                            <Form.Group key={field} className="mb-2">
                              <Form.Label className="small fw-semibold text-capitalize">{field.replace('_', ' ')}</Form.Label>
                              {field === 'content' || field === 'intro' || field === 'subtitle' ? (
                                <Form.Control 
                                  as="textarea" 
                                  rows={3} 
                                  name={field} 
                                  value={formData[field] || ''} 
                                  onChange={handleFormChange}
                                  placeholder={`Enter ${field.replace('_', ' ')}`}
                                />
                              ) : field === 'items' ? (
                                <Form.Control 
                                  as="textarea" 
                                  rows={4} 
                                  name={field} 
                                  value={Array.isArray(formData[field]) ? formData[field].join('\n') : formData[field] || ''} 
                                  onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value.split('\n').filter(Boolean) }))}
                                  placeholder="Enter each item on a new line"
                                />
                              ) : (
                                <Form.Control 
                                  type="text" 
                                  name={field} 
                                  value={formData[field] || ''} 
                                  onChange={handleFormChange}
                                  placeholder={`Enter ${field.replace('_', ' ')}`}
                                />
                              )}
                            </Form.Group>
                          ))}
                        </>
                      ) : (
                        <div>
                          {section.fields.map(field => {
                            const value = sectionContent[field] || getDefaultContent(activeCategory, section.id, field);
                            if (!value) return null;
                            const displayValue = Array.isArray(value) ? value.join(', ') : value;
                            return (
                              <div key={field} className="mb-2">
                                <div className="text-muted small text-capitalize">{field.replace('_', ' ')}:</div>
                                <div className="small" style={{ wordBreak: 'break-word' }}>
                                  {displayValue.length > 100 ? displayValue.substring(0, 100) + '...' : displayValue}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      )}
    </div>
  );
};

// ============================================================
// FOOTER SETTINGS MANAGER - No localStorage
// ============================================================
const FooterSettingsManager = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    schoolName: "Kitale Progressive School",
    tagline: "Molding character, Inspiring excellence.",
    address: "Kitale-Kapenguria RD",
    phone: "+254 736 756 595",
    email: "kitaleprogressivesocial@gmail.com",
    mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.1549118880284!2d34.995235373490296!3d1.0448587624833654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x178226623113cbbd%3A0x9bc6b39a5f193f4a!2sKitale%20Progressive%20School%3A%20Top%20Private%20Christian%20School%20in%20Trans%20Nzoia%3A!5e0!3m2!1sen!2ske!4v1777746404738!5m2!1sen!2ske",
    socialLinks: [
      { icon: "bi-facebook", url: "https://www.facebook.com/kitaleprogressive/", label: "Facebook" },
      { icon: "bi-instagram", url: "https://www.instagram.com/kitaleprogrsv1338/", label: "Instagram" },
      { icon: "bi-youtube", url: "https://www.youtube.com/@KPSConnect", label: "YouTube" },
      { icon: "bi-tiktok", url: "https://www.tiktok.com/@kitale.progressive", label: "TikTok" },
      { icon: "bi-whatsapp", url: "https://wa.me/254780841116", label: "WhatsApp" }
    ]
  });
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [editingSocialIndex, setEditingSocialIndex] = useState(null);
  const [socialFormData, setSocialFormData] = useState({ icon: '', url: '', label: '' });
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const socialIcons = [
    'bi-facebook', 'bi-instagram', 'bi-youtube', 'bi-tiktok', 'bi-whatsapp',
    'bi-twitter', 'bi-linkedin', 'bi-pinterest', 'bi-snapchat', 'bi-telegram',
    'bi-discord', 'bi-reddit', 'bi-tumblr', 'bi-vimeo', 'bi-yelp'
  ];

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFooterSettings();
      if (data) {
        setSettings(data);
        console.log('Footer settings loaded from JSON Bin');
      }
    } catch (error) {
      console.error('Error loading footer settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettingsToJsonBin = async (newSettings) => {
    setSaving(true);
    try {
      const result = await saveFooterSettings(newSettings);
      if (result) {
        setSettings(newSettings);
        setAlert({ show: true, type: 'success', message: 'Footer settings saved successfully!' });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
      }
    } catch (error) {
      console.error('Error saving footer settings:', error);
      setAlert({ show: true, type: 'danger', message: 'Failed to save footer settings: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    saveSettingsToJsonBin(settings);
  };

  const handleReset = () => {
    if (window.confirm('Reset footer settings to default?')) {
      const defaultSettings = {
        schoolName: "Kitale Progressive School",
        tagline: "Molding character, Inspiring excellence.",
        address: "Kitale-Kapenguria RD",
        phone: "+254 736 756 595",
        email: "kitaleprogressivesocial@gmail.com",
        mapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.1549118880284!2d34.995235373490296!3d1.0448587624833654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x178226623113cbbd%3A0x9bc6b39a5f193f4a!2sKitale%20Progressive%20School%3A%20Top%20Private%20Christian%20School%20in%20Trans%20Nzoia%3A!5e0!3m2!1sen!2ske!4v1777746404738!5m2!1sen!2ske",
        socialLinks: [
          { icon: "bi-facebook", url: "https://www.facebook.com/kitaleprogressive/", label: "Facebook" },
          { icon: "bi-instagram", url: "https://www.instagram.com/kitaleprogrsv1338/", label: "Instagram" },
          { icon: "bi-youtube", url: "https://www.youtube.com/@KPSConnect", label: "YouTube" },
          { icon: "bi-tiktok", url: "https://www.tiktok.com/@kitale.progressive", label: "TikTok" },
          { icon: "bi-whatsapp", url: "https://wa.me/254780841116", label: "WhatsApp" }
        ]
      };
      saveSettingsToJsonBin(defaultSettings);
    }
  };

  const handleAddSocial = () => {
    setEditingSocialIndex(null);
    setSocialFormData({ icon: 'bi-facebook', url: '', label: '' });
    setShowSocialModal(true);
  };

  const handleEditSocial = (index) => {
    setEditingSocialIndex(index);
    setSocialFormData(settings.socialLinks[index]);
    setShowSocialModal(true);
  };

  const handleDeleteSocial = (index) => {
    if (window.confirm('Delete this social media link?')) {
      const newSocialLinks = settings.socialLinks.filter((_, i) => i !== index);
      const newSettings = { ...settings, socialLinks: newSocialLinks };
      saveSettingsToJsonBin(newSettings);
    }
  };

  const handleSaveSocial = () => {
    if (!socialFormData.url || !socialFormData.label) {
      setAlert({ show: true, type: 'danger', message: 'Please fill in all social media fields.' });
      setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
      return;
    }

    let newSocialLinks;
    if (editingSocialIndex !== null) {
      newSocialLinks = settings.socialLinks.map((item, i) => 
        i === editingSocialIndex ? socialFormData : item
      );
    } else {
      newSocialLinks = [...settings.socialLinks, socialFormData];
    }

    const newSettings = { ...settings, socialLinks: newSocialLinks };
    saveSettingsToJsonBin(newSettings);
    setShowSocialModal(false);
    setAlert({ show: true, type: 'success', message: `Social link ${editingSocialIndex !== null ? 'updated' : 'added'}!` });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
  };

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="h5 fw-bold mb-0">Footer Settings</h3>
        <div className="d-flex gap-2">
          <Button variant="outline-danger" size="sm" onClick={handleReset} disabled={saving}>
            <i className="fas fa-undo me-1"></i> Reset to Default
          </Button>
          <Button className="btn-navy" size="sm" onClick={handleSave} disabled={saving}>
            <i className="fas fa-save me-1"></i> Save All
          </Button>
        </div>
      </div>

      {alert.show && <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false })} className="mb-3">{alert.message}</Alert>}

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <h4 className="h6 fw-bold mb-3">General Information</h4>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold">School Name</Form.Label>
                <Form.Control 
                  type="text" 
                  name="schoolName" 
                  value={settings.schoolName} 
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Tagline</Form.Label>
                <Form.Control 
                  type="text" 
                  name="tagline" 
                  value={settings.tagline} 
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Address</Form.Label>
                <Form.Control 
                  type="text" 
                  name="address" 
                  value={settings.address} 
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Phone</Form.Label>
                <Form.Control 
                  type="text" 
                  name="phone" 
                  value={settings.phone} 
                  onChange={handleChange}
                  placeholder="+254 736 756 595"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Email</Form.Label>
                <Form.Control 
                  type="email" 
                  name="email" 
                  value={settings.email} 
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <h4 className="h6 fw-bold mb-3">Google Maps</h4>
          <Form.Group>
            <Form.Label className="small fw-semibold">Map Embed URL</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              name="mapEmbed" 
              value={settings.mapEmbed} 
              onChange={handleChange}
              placeholder="Paste your Google Maps embed URL here"
            />
            <Form.Text className="text-muted">
              Get the embed URL from Google Maps → Share → Embed a map
            </Form.Text>
          </Form.Group>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="h6 fw-bold mb-0">Social Media Links</h4>
            <Button variant="outline-primary" size="sm" onClick={handleAddSocial} disabled={saving}>
              <i className="fas fa-plus me-1"></i> Add Social Link
            </Button>
          </div>

          <div className="admin-table-wrapper">
            <Table responsive hover className="admin-table">
              <thead>
                <tr>
                  <th>Icon</th>
                  <th>Label</th>
                  <th>URL</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {settings.socialLinks && settings.socialLinks.length > 0 ? (
                  settings.socialLinks.map((social, index) => (
                    <tr key={index}>
                      <td>
                        <i className={`bi ${social.icon}`} style={{ fontSize: '1.2rem', color: '#050265' }}></i>
                      </td>
                      <td>{social.label}</td>
                      <td className="text-truncate" style={{ maxWidth: '200px' }}>
                        <a href={social.url} target="_blank" rel="noopener noreferrer" className="text-navy">
                          {social.url}
                        </a>
                      </td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEditSocial(index)} disabled={saving}>
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDeleteSocial(index)} disabled={saving}>
                          <i className="fas fa-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-3">
                      No social media links added. Click "Add Social Link" to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showSocialModal} onHide={() => setShowSocialModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingSocialIndex !== null ? 'Edit Social Link' : 'Add Social Link'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Icon</Form.Label>
              <Form.Select 
                value={socialFormData.icon} 
                onChange={(e) => setSocialFormData({ ...socialFormData, icon: e.target.value })}
              >
                {socialIcons.map(icon => (
                  <option key={icon} value={icon}>
                    {icon.replace('bi-', '').charAt(0).toUpperCase() + icon.replace('bi-', '').slice(1)}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                <i className={`bi ${socialFormData.icon} me-1`}></i> Preview: <i className={`bi ${socialFormData.icon}`}></i>
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Label</Form.Label>
              <Form.Control 
                type="text" 
                value={socialFormData.label} 
                onChange={(e) => setSocialFormData({ ...socialFormData, label: e.target.value })}
                placeholder="e.g., Facebook, Instagram"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">URL</Form.Label>
              <Form.Control 
                type="url" 
                value={socialFormData.url} 
                onChange={(e) => setSocialFormData({ ...socialFormData, url: e.target.value })}
                placeholder="https://www.facebook.com/yourpage"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSocialModal(false)} disabled={saving}>Cancel</Button>
          <Button className="btn-navy" onClick={handleSaveSocial} disabled={saving}>
            {editingSocialIndex !== null ? 'Update' : 'Add'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Card className="border-0 shadow-sm mt-4">
        <Card.Body>
          <h4 className="h6 fw-bold mb-3">
            <i className="fas fa-eye me-2"></i> Live Preview
          </h4>
          <div style={{ 
            padding: '1rem', 
            background: 'linear-gradient(135deg, #050265, #0d65fb)', 
            borderRadius: '12px',
            color: 'white'
          }}>
            <div className="d-flex flex-wrap gap-3 align-items-center">
              <div>
                <strong>{settings.schoolName}</strong>
                <div className="small">{settings.tagline}</div>
              </div>
              <div className="ms-auto d-flex gap-2">
                {settings.socialLinks && settings.socialLinks.slice(0, 3).map((social, i) => (
                  <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" style={{ color: 'white', fontSize: '1.2rem' }}>
                    <i className={`bi ${social.icon}`}></i>
                  </a>
                ))}
                {settings.socialLinks && settings.socialLinks.length > 3 && (
                  <span className="small">+{settings.socialLinks.length - 3}</span>
                )}
              </div>
            </div>
            <div className="mt-2 small" style={{ opacity: 0.8 }}>
              📍 {settings.address} | 📞 {settings.phone} | ✉️ {settings.email}
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

// ============================================================
// SETTINGS MANAGER - No localStorage
// ============================================================
const SettingsManager = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSettings();
      if (data) {
        setSettings(data);
        console.log('Settings loaded from JSON Bin');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setAlert({ show: true, type: 'danger', message: 'Failed to load settings.' });
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettingsToJsonBin = async (newSettings) => {
    setSaving(true);
    try {
      const result = await saveSettings(newSettings);
      if (result) {
        setSettings(newSettings);
        setAlert({ show: true, type: 'success', message: 'Settings saved successfully!' });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setAlert({ show: true, type: 'danger', message: 'Failed to save settings: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    saveSettingsToJsonBin(settings);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data? This will delete all custom content.')) {
      // Only reset auth session, not data
      localStorage.removeItem('adminAuthenticated');
      localStorage.removeItem('adminExpiry');
      window.location.reload();
    }
  };

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="h5 fw-bold mb-0">Site Settings</h3>
        <Button variant="outline-danger" size="sm" onClick={handleReset} disabled={saving}>
          <i className="fas fa-trash-alt me-1"></i> Reset Session
        </Button>
      </div>
      {alert.show && <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false })} className="mb-3">{alert.message}</Alert>}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h4 className="h6 fw-bold mb-3">General Information</h4>
          <Row className="g-3 mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold">School Name</Form.Label>
                <Form.Control type="text" name="schoolName" value={settings.schoolName || ''} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold">School Email</Form.Label>
                <Form.Control type="email" name="schoolEmail" value={settings.schoolEmail || ''} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold">School Phone</Form.Label>
                <Form.Control type="text" name="schoolPhone" value={settings.schoolPhone || ''} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small fw-semibold">School Address</Form.Label>
                <Form.Control type="text" name="schoolAddress" value={settings.schoolAddress || ''} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>
          <h4 className="h6 fw-bold mb-3">Social Media Links</h4>
          <Row className="g-3 mb-4">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Facebook</Form.Label>
                <Form.Control type="url" name="facebookUrl" value={settings.facebookUrl || ''} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold">Instagram</Form.Label>
                <Form.Control type="url" name="instagramUrl" value={settings.instagramUrl || ''} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold">YouTube</Form.Label>
                <Form.Control type="url" name="youtubeUrl" value={settings.youtubeUrl || ''} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold">TikTok</Form.Label>
                <Form.Control type="url" name="tiktokUrl" value={settings.tiktokUrl || ''} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-semibold">WhatsApp</Form.Label>
                <Form.Control type="url" name="whatsappUrl" value={settings.whatsappUrl || ''} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>
          <h4 className="h6 fw-bold mb-3">Google Maps</h4>
          <Form.Group className="mb-4">
            <Form.Label className="small fw-semibold">Google Maps Embed URL</Form.Label>
            <Form.Control as="textarea" rows={3} name="googleMapsEmbed" value={settings.googleMapsEmbed || ''} onChange={handleChange} />
          </Form.Group>
          <div className="text-end">
            <Button className="btn-navy" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                'Save All Settings'
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

// ============================================================
// MAIN ADMIN COMPONENT
// ============================================================
function Admin() {
  const { isAuthenticated, isLoading, login, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ blogs: 0, events: 0, gallery: 0, testimonials: 0, faq: 0, partners: 0 });

  const updateStats = useCallback(async () => {
    try {
      const blogs = await getBlogs();
      const events = await getEvents();
      const gallery = await getGallery();
      const testimonials = await getTestimonials();
      const faq = await getFAQ();
      const partners = await getPartners();
      
      const faqCount = faq ? faq.reduce((sum, cat) => sum + (cat.questions?.length || 0), 0) : 0;
      
      setStats({
        blogs: Array.isArray(blogs) ? blogs.length : 0,
        events: Array.isArray(events) ? events.length : 0,
        gallery: Array.isArray(gallery) ? gallery.length : 0,
        testimonials: Array.isArray(testimonials) ? testimonials.length : 0,
        faq: faqCount,
        partners: Array.isArray(partners) ? partners.length : 0
      });
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }, []);

  useEffect(() => {
    updateStats();
  }, [updateStats]);

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted small">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardOverview stats={stats} />;
      case 'blogs': return <BlogsManager />;
      case 'events': return <EventsManager />;
      case 'gallery': return <GalleryManager />;
      case 'testimonials': return <TestimonialsManager />;
      case 'faq': return <FAQManager />;
      case 'partner': return <PartnersManager />;
      case 'fee-structure': return <FeeStructureManager />;
      case 'pages': return <PagesManager />;
      case 'footer': return <FooterSettingsManager />;
      case 'settings': return <SettingsManager />;
      default: return <DashboardOverview stats={stats} />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Kitale Progressive School</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="admin-wrapper">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={logout} />
        <main className="admin-main">
          <div className="admin-header">
            <h1 className="h4 fw-bold mb-0">Admin Dashboard</h1>
            <div className="admin-user">
              <i className="fas fa-user-shield me-1"></i>
              <span className="small">Administrator</span>
            </div>
          </div>
          <div className="admin-content">{renderContent()}</div>
        </main>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-wrapper { display: flex; min-height: 100vh; background: #f5f7fb; }
        .admin-sidebar { width: 260px; background: linear-gradient(135deg, #050265, #0d65fb); color: white; display: flex; flex-direction: column; position: fixed; height: 100vh; overflow-y: auto; z-index: 1000; }
        .admin-sidebar-header { padding: 1.5rem; font-size: 1.2rem; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .admin-sidebar-nav { flex: 1; padding: 1rem 0; }
        .admin-sidebar-item { display: flex; align-items: center; gap: 0.75rem; width: 100%; padding: 0.75rem 1.5rem; background: transparent; border: none; color: rgba(255,255,255,0.8); cursor: pointer; transition: all 0.2s ease; text-align: left; font-size: 0.9rem; }
        .admin-sidebar-item:hover { background: rgba(255,255,255,0.1); color: white; }
        .admin-sidebar-item.active { background: rgba(255,255,255,0.15); color: white; border-left: 3px solid #ff0080; }
        .admin-sidebar-item i { width: 20px; }
        .admin-sidebar-logout { display: flex; align-items: center; gap: 0.75rem; width: 100%; padding: 0.75rem 1.5rem; background: transparent; border: none; color: rgba(255,255,255,0.8); cursor: pointer; transition: all 0.2s ease; text-align: left; font-size: 0.9rem; border-top: 1px solid rgba(255,255,255,0.1); margin-top: auto; }
        .admin-sidebar-logout:hover { background: rgba(220, 53, 69, 0.3); color: white; }
        .admin-main { flex: 1; margin-left: 260px; min-height: 100vh; }
        .admin-header { background: white; padding: 1rem 1.5rem; border-bottom: 1px solid #e9ecef; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 999; }
        .admin-user { display: flex; align-items: center; gap: 0.5rem; color: #050265; }
        .admin-content { padding: 1.5rem; }
        .admin-stat-card { transition: transform 0.2s ease; }
        .admin-stat-card:hover { transform: translateY(-2px); }
        .admin-stat-value { font-size: 1.8rem; font-weight: 700; color: #050265; }
        .admin-stat-label { font-size: 0.75rem; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px; }
        .admin-stat-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }
        .admin-table-wrapper { overflow-x: auto; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .admin-table { margin-bottom: 0; }
        .admin-table th { background: #f8f9fa; border-bottom: 2px solid #e9ecef; font-weight: 600; font-size: 0.8rem; }
        .admin-gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
        .admin-gallery-item { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .admin-gallery-image { position: relative; aspect-ratio: 4/3; overflow: hidden; }
        .admin-gallery-image img { width: 100%; height: 100%; object-fit: cover; }
        .admin-gallery-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; gap: 0.5rem; opacity: 0; transition: opacity 0.2s ease; }
        .admin-gallery-item:hover .admin-gallery-overlay { opacity: 1; }
        .admin-gallery-info { padding: 0.5rem; text-align: center; }
        .admin-login-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #050265, #0d65fb); }
        .admin-login-box { background: white; padding: 2rem; border-radius: 20px; width: 100%; max-width: 400px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
        .admin-logo { font-size: 2rem; }
        .admin-loading { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f5f7fb; }
        .image-upload-area { border: 2px dashed #dee2e6; border-radius: 12px; padding: 1rem; text-align: center; cursor: pointer; background-color: #f8f9fa; transition: all 0.2s ease; }
        .image-upload-area:hover { border-color: #0d65fb; background-color: #f0f4ff; }
        @media (max-width: 768px) { 
          .admin-sidebar { transform: translateX(-100%); transition: transform 0.3s ease; } 
          .admin-sidebar.open { transform: translateX(0); } 
          .admin-main { margin-left: 0; } 
          .admin-gallery-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); } 
        }
      `}} />
    </>
  );
}

export default Admin;