// pages/Blogs.jsx - Fixed BlogCard rendering
import React, { useState, useEffect, useCallback, memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Row, Col, Spinner, Alert, Modal, Badge, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FacebookShareButton, TwitterShareButton, WhatsappShareButton, LinkedinShareButton } from 'react-share';

// ==================== UTILITY FUNCTIONS ====================
const getReadingTime = (content) => {
  if (!content) return '3 min read';
  const wordsPerMinute = 200;
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return `${Math.ceil(wordCount / wordsPerMinute)} min read`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const formatShortDate = (dateString) => {
  if (!dateString) return '';
  const options = { month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// ==================== STORAGE UTILITY ====================
const setupPersistentStorage = async () => {
  try {
    if (typeof window !== 'undefined' && 'storage' in navigator && 'persist' in navigator.storage) {
      const isPersisted = await navigator.storage.persisted();
      if (!isPersisted) {
        const isPersistent = await navigator.storage.persist();
        if (isPersistent) {
          console.log('Persistent storage granted');
        }
      }
      return isPersisted;
    }
  } catch (error) {
    console.debug('Storage persistence not available:', error.message);
  }
  return false;
};

// ==================== CONTENT RENDERER ====================
const renderContent = (content) => {
  if (!content) return '';
  
  if (/<h[1-6]/.test(content)) {
    return content;
  }
  
  let html = content;
  
  html = html.replace(/^# (.*?)(?:\n|$)/gm, '<h2>$1</h2>');
  html = html.replace(/^## (.*?)(?:\n|$)/gm, '<h3>$1</h3>');
  html = html.replace(/^### (.*?)(?:\n|$)/gm, '<h4>$1</h4>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  const paragraphs = html.split('\n\n').filter(p => p.trim());
  html = paragraphs
    .map(para => {
      const trimmed = para.trim();
      if (/^<h[1-6]/.test(trimmed) || /^<p>/.test(trimmed) || /^<strong>/.test(trimmed)) {
        return trimmed;
      }
      if (!trimmed) return '';
      return `<p>${trimmed}</p>`;
    })
    .filter(Boolean)
    .join('\n');
  
  return html;
};

// ==================== OPTIMIZED IMAGE COMPONENT ====================
const OptimizedImage = memo(({ src, alt, priority = false, className = "" }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="bg-light d-flex align-items-center justify-content-center" style={{
        width: '100%',
        height: '100%',
        minHeight: '250px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, #f5f5f5, #e0e0e0)'
      }}>
        <div className="text-center">
          <i className="fas fa-image" style={{ fontSize: '3rem', color: '#ccc' }}></i>
          <div className="text-muted small mt-2">Image not available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="curriculum-image-wrapper">
      {!loaded && <div className="image-skeleton" />}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchpriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`curriculum-image ${className}`}
      />
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// ==================== SHARE MODAL COMPONENT ====================
const ShareModal = memo(({ show, onClose, post, url }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareTitle = post?.title || "Check out this article from Kitale Progressive School";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Modal show={show} onClose={onClose} centered size="sm" className="share-modal">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="h5 fw-bold" style={{ color: '#050265' }}>
          <i className="fas fa-share-alt me-2" style={{ color: '#ffd700' }}></i>
          Share this article
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-0">
        <div className="d-flex flex-wrap justify-content-center gap-3 my-4">
          <FacebookShareButton url={shareUrl} quote={shareTitle}>
            <span className="share-btn facebook" role="button" aria-label="Share on Facebook">
              <i className="fab fa-facebook-f"></i>
            </span>
          </FacebookShareButton>
          
          <TwitterShareButton url={shareUrl} title={shareTitle}>
            <span className="share-btn twitter" role="button" aria-label="Share on Twitter">
              <i className="fab fa-twitter"></i>
            </span>
          </TwitterShareButton>
          
          <WhatsappShareButton url={shareUrl} title={shareTitle}>
            <span className="share-btn whatsapp" role="button" aria-label="Share on WhatsApp">
              <i className="fab fa-whatsapp"></i>
            </span>
          </WhatsappShareButton>
          
          <LinkedinShareButton url={shareUrl} title={shareTitle}>
            <span className="share-btn linkedin" role="button" aria-label="Share on LinkedIn">
              <i className="fab fa-linkedin-in"></i>
            </span>
          </LinkedinShareButton>
        </div>
        
        <div className="border-top pt-3">
          <label className="small fw-semibold mb-2" style={{ color: '#050265' }}>Or copy link</label>
          <div className="d-flex gap-2">
            <input 
              type="text" 
              readOnly 
              value={shareUrl} 
              className="form-control form-control-sm bg-light" 
              style={{ fontSize: '0.8rem', borderRadius: '50px' }}
            />
            <button 
              onClick={copyToClipboard}
              className="btn-copy"
              style={{
                padding: '0.3rem 1.2rem',
                fontSize: '0.8rem',
                borderRadius: '50px',
                background: copied ? '#28a745' : '#050265',
                color: 'white',
                border: 'none',
                transition: 'all 0.3s ease'
              }}
            >
              {copied ? <i className="fas fa-check me-1"></i> : null}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
});

ShareModal.displayName = 'ShareModal';

// ==================== BLOG CARD COMPONENT - FIXED ====================
const BlogCard = memo(({ post, onClick }) => {
  const handleClick = () => onClick(post);
  
  const getPlainExcerpt = (content) => {
    if (!content) return '';
    let plainText = content
      .replace(/<[^>]*>/g, '')
      .replace(/# /g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '');
    return plainText.substring(0, 120) + '...';
  };
  
  return (
    <div
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
      role="article"
      tabIndex={0}
      className="blog-card card-custom"
    >
      <div className="position-relative">
        <OptimizedImage src={post.featuredImage || post.image || '/images/placeholder.jpg'} alt={post.title} />
        <Badge 
          bg="dark" 
          className="position-absolute top-0 start-0 m-3 blog-badge"
        >
          {post.category || "News"}
        </Badge>
      </div>
      
      <div className="blog-card-body">
        <div className="blog-meta">
          <span><i className="far fa-calendar-alt me-1"></i> {formatShortDate(post.date) || 'Recent'}</span>
          <span><i className="far fa-clock me-1"></i> {getReadingTime(post.content)}</span>
          <span><i className="far fa-user me-1"></i> {post.author || "Admin"}</span>
        </div>
        
        <h3 className="blog-title">{post.title || 'Untitled Post'}</h3>
        
        <p className="blog-excerpt">
          {post.excerpt || getPlainExcerpt(post.content)}
        </p>
        
        <button className="btn-navy read-more-btn" onClick={(e) => { e.stopPropagation(); handleClick(); }}>
          Read more 
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
});

BlogCard.displayName = 'BlogCard';

// ==================== CATEGORY FILTER COMPONENT ====================
const CategoryFilter = memo(({ categories, selectedCategory, onSelect }) => {
  const allCategories = ["All", ...new Set(categories)];

  return (
    <div className="category-filter">
      {allCategories.map(category => (
        <button
          key={category}
          onClick={() => onSelect(category === "All" ? null : category)}
          className={`category-btn ${selectedCategory === category || (category === "All" && !selectedCategory) ? 'active' : ''}`}
        >
          {category}
        </button>
      ))}
    </div>
  );
});

CategoryFilter.displayName = 'CategoryFilter';

// ==================== BLOG DETAIL MODAL COMPONENT ====================
const BlogDetailModal = memo(({ show, post, onClose, onShare }) => {
  if (!post) return null;

  const renderedContent = renderContent(post.content);
  const renderedFullStory = post.fullStory ? renderContent(post.fullStory) : '';

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      size="lg" 
      centered 
      dialogClassName="blog-detail-modal"
      scrollable={true}
      fullscreen="sm-down"
    >
      <Modal.Header closeButton>
        <Modal.Title>{post.title}</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {post.featuredImage && (
          <div className="mb-4 image-shadow blog-featured-image">
            <img 
              src={post.featuredImage} 
              alt={post.title} 
              className="img-fluid"
              onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
            />
          </div>
        )}

        <div className="blog-meta-detail">
          <span><i className="far fa-calendar-alt"></i> {formatDate(post.date)}</span>
          <span><i className="far fa-user"></i> By {post.author || "Admin"}</span>
          <span><i className="fas fa-tag"></i> {post.category}</span>
          <span><i className="far fa-clock"></i> {getReadingTime(post.content)}</span>
        </div>

        <div className="blog-content-consistent">
          {renderedContent ? (
            <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
          ) : (
            <p>{post.excerpt}</p>
          )}
          
          {renderedFullStory && (
            <>
              <hr className="my-4" />
              <h5 className="fw-bold mb-3">More Details</h5>
              <div dangerouslySetInnerHTML={{ __html: renderedFullStory }} />
            </>
          )}
        </div>
      </Modal.Body>
      
      <Modal.Footer>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="fw-semibold share-label">Share:</span>
          
          <FacebookShareButton url={window.location.href} quote={post.title}>
            <span className="share-icon-btn facebook" role="button" aria-label="Share on Facebook">
              <i className="fab fa-facebook-f"></i>
            </span>
          </FacebookShareButton>
          
          <TwitterShareButton url={window.location.href} title={post.title}>
            <span className="share-icon-btn twitter" role="button" aria-label="Share on Twitter">
              <i className="fab fa-twitter"></i>
            </span>
          </TwitterShareButton>
          
          <WhatsappShareButton url={window.location.href} title={post.title}>
            <span className="share-icon-btn whatsapp" role="button" aria-label="Share on WhatsApp">
              <i className="fab fa-whatsapp"></i>
            </span>
          </WhatsappShareButton>
          
          <LinkedinShareButton url={window.location.href} title={post.title}>
            <span className="share-icon-btn linkedin" role="button" aria-label="Share on LinkedIn">
              <i className="fab fa-linkedin-in"></i>
            </span>
          </LinkedinShareButton>
          
          <span 
            onClick={() => onShare(post)} 
            className="share-icon-btn copy-link"
            role="button"
            aria-label="Copy link"
          >
            <i className="fas fa-link"></i>
          </span>
        </div>
        <button onClick={onClose} className="btn-outline-navy">
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
});

BlogDetailModal.displayName = 'BlogDetailModal';

// ==================== HELPER: LOAD BLOGS FROM LOCALSTORAGE ====================
const loadBlogsFromStorage = () => {
  try {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('admin_blogs');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error parsing blogs from localStorage:', e);
  }
  return null;
};

// ==================== MOCK DATA (FALLBACK) ====================
const getMockPosts = () => {
  // First try to load from localStorage
  const storedBlogs = loadBlogsFromStorage();
  if (storedBlogs) {
    console.log('Blogs loaded from localStorage:', storedBlogs.length, 'posts');
    return storedBlogs;
  }
  
  console.log('No blogs in localStorage, using mock data');
  return [
    {
      id: 1,
      slug: "annual-sports-day-2024",
      title: "Annual Sports Day 2024: A Celebration of Talent",
      excerpt: "Students showcased exceptional athletic abilities during our annual sports day event...",
      content: "The annual sports day was a spectacular event filled with excitement and competition...",
      fullStory: "Students from all grades participated in various athletic events...",
      featuredImage: "/images/optimized/gallery/sports1.webp",
      author: "Mr. Omondi",
      date: "2024-12-01",
      category: "School Event",
    },
    {
      id: 2,
      slug: "excellence-in-cbc-grade-6",
      title: "Excellence in CBC: Our Grade 6 Learners Shine",
      excerpt: "Our Grade 6 learners demonstrated outstanding performance in the recent CBC assessments...",
      content: "The Competency-Based Curriculum has transformed how our students learn and grow...",
      fullStory: "Our Grade 6 learners have shown remarkable progress in all competency areas...",
      featuredImage: "/images/optimized/academics1.webp",
      author: "Madam Sarah",
      date: "2024-11-15",
      category: "Academic Achievement",
    },
    {
      id: 3,
      slug: "student-council-elections-2024",
      title: "Building Future Leaders: Student Council Elections",
      excerpt: "Democracy in action as our students participated in the annual student council elections...",
      content: "The student council elections provide valuable leadership experience for our learners...",
      fullStory: "Candidates presented their manifestos and campaigned across the school...",
      featuredImage: "/images/optimized/gallery/events3.webp",
      author: "Mr. Kipchoge",
      date: "2024-10-20",
      category: "Student Leadership",
    }
  ];
};

// ==================== BLOG SECTION COMPONENT ====================
export const BlogSection = ({ limit, showViewAll, variant = 'gold' }) => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentShareUrl, setCurrentShareUrl] = useState('');

  const variants = {
    gold: {
      primary: '#0d65fb',
      badge: 'var(--gold)'
    },
    navy: {
      primary: '#0d65fb',
      badge: 'var(--navy)'
    }
  };

  const colors = variants[variant] || variants.gold;

  const loadPosts = useCallback(() => {
    setLoading(true);
    try {
      const posts = getMockPosts();
      const limitedPosts = limit ? posts.slice(0, limit) : posts;
      setBlogPosts(limitedPosts);
      setError(null);
    } catch (err) {
      console.error('Error loading blog posts:', err);
      setError('Unable to load blog posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setupPersistentStorage();
    }
    loadPosts();

    const handleStorageChange = (e) => {
      if (e.key === 'admin_blogs') {
        console.log('BlogSection: admin_blogs changed, reloading...');
        loadPosts();
      }
    };

    const handleAdminDataChange = (e) => {
      if (e.detail?.key === 'admin_blogs') {
        console.log('BlogSection: adminDataChange event received, reloading...');
        loadPosts();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('adminDataChange', handleAdminDataChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('adminDataChange', handleAdminDataChange);
    };
  }, [loadPosts]);

  const handleReadMore = (post) => {
    setSelectedPost(post);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedPost(null);
  };

  const handleShare = (post) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    setCurrentShareUrl(url);
    setShowShareModal(true);
  };

  return (
    <>
      <section id="blog-section" className="section-padding bg-light-custom" aria-labelledby="blog-heading">
        <Container>
          <div className="text-center mb-5">
            <div className="blog-section-badge" style={{ background: colors.primary }}>
              <span aria-hidden="true">📝</span>
              <span className="fw-bold text-white">Latest News </span>
            </div>
            <h2 id="blog-heading" className="section-heading py-3">
              Stay Updated with Our School Community
            </h2>
            <p className="text-muted blog-subtitle">
              Discover insights, stories, and updates from Kitale Progressive School
            </p>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading latest posts...</p>
            </div>
          ) : error ? (
            <Alert variant="warning" className="text-center">{error}</Alert>
          ) : blogPosts.length > 0 ? (
            <>
              <Row className="g-4" role="list" aria-label="Blog posts">
                {blogPosts.map((post) => (
                  <Col key={post.id} md={6} lg={4} role="listitem">
                    <BlogCard post={post} onClick={handleReadMore} />
                  </Col>
                ))}
              </Row>

              {showViewAll && (
                <div className="text-center mt-5">
                  <Link to="/school-life/blogs">
                    <button className="btn-navy">View All News & Updates</button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <Alert variant="info" className="text-center">
              No blog posts available at the moment. Check back soon for updates!
            </Alert>
          )}
        </Container>
      </section>

      <BlogDetailModal 
        show={showDetailModal}
        post={selectedPost}
        onClose={handleCloseDetailModal}
        onShare={handleShare}
      />

      <ShareModal 
        show={showShareModal} 
        onClose={() => setShowShareModal(false)} 
        post={selectedPost} 
        url={currentShareUrl} 
      />
    </>
  );
};

// ==================== MAIN BLOGS COMPONENT ====================
const Blogs = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blogPosts, setBlogPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentShareUrl, setCurrentShareUrl] = useState('');

  const loadPosts = useCallback(() => {
    setLoading(true);
    try {
      const posts = getMockPosts();
      setBlogPosts(posts);
      setError(null);
    } catch (err) {
      console.error('Error loading blog posts:', err);
      setError("Unable to load blog posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setupPersistentStorage();
    }
    loadPosts();

    const handleStorageChange = (e) => {
      if (e.key === 'admin_blogs') {
        console.log('Blogs: admin_blogs changed, reloading...');
        loadPosts();
      }
    };

    const handleAdminDataChange = (e) => {
      if (e.detail?.key === 'admin_blogs') {
        console.log('Blogs: adminDataChange event received, reloading...');
        loadPosts();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('adminDataChange', handleAdminDataChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('adminDataChange', handleAdminDataChange);
    };
  }, [loadPosts]);

  const filteredPosts = selectedCategory 
    ? blogPosts.filter(post => post.category === selectedCategory)
    : blogPosts;

  const categories = blogPosts.map(post => post.category);

  const handleReadMore = (post) => {
    setSelectedPost(post);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedPost(null);
  };

  const handleShare = (post) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    setCurrentShareUrl(url);
    setShowShareModal(true);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  return (
    <>
      <Helmet>
        <title>Blogs | Insights & Stories | Kitale Progressive School</title>
        <meta name="description" content="Explore insights, stories, and updates from Kitale Progressive School." />
      </Helmet>

      <section className="blogs-hero-section" aria-labelledby="page-title">
        <div className="blogs-hero-content">
          <h1 id="page-title">BLOG</h1>
          <p>Educational Insights &amp; Articles from Kitale Progressive School</p>
        </div>
      </section>

      <section className="blog-main-section py-5 bg-light-custom">
        <Container>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading amazing stories...</p>
            </div>
          ) : error ? (
            <Alert variant="warning" className="text-center rounded-4">{error}</Alert>
          ) : (
            <>
              <div className="text-center mb-5">
                <div className="parent-hook-badge">
                  <i className="fas fa-lightbulb me-2"></i> 
                  For Parents & Educators
                </div>
                <h2 className="section-heading mb-3" style={{ color: '#050265' }}>
                  Discover, Learn, and Grow
                </h2>
                <p className="text-muted blog-subtitle">
                  Explore articles that help you understand your child's learning journey and how to support their growth.
                </p>
              </div>
              
              <CategoryFilter 
                categories={categories} 
                selectedCategory={selectedCategory} 
                onSelect={handleCategorySelect} 
              />
              
              <Row className="g-4">
                {filteredPosts.map(post => (
                  <Col key={post.id} md={6} lg={4}>
                    <BlogCard post={post} onClick={handleReadMore} />
                  </Col>
                ))}
              </Row>
              
              {filteredPosts.length === 0 && (
                <div className="text-center py-5">
                  <i className="fas fa-search" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                  <h4 className="mt-3 text-muted">No posts found</h4>
                  <p>Try selecting a different category</p>
                  <button onClick={() => handleCategorySelect(null)} className="btn-navy">View All Posts</button>
                </div>
              )}

              <Row className="mt-5">
                <Col lg={8} className="mx-auto">
                  <Card className="card-custom border-0 shadow-lg blog-cta-card">
                    <Card.Body className="p-4 p-lg-5 text-center">
                      <h3 className="h4 fw-bold mb-2 text-white">
                        Still Have Questions or Ready to Take the Next Step?
                      </h3>
                      <p className="mb-3 text-white opacity-90">
                        Our admissions team is ready to guide you. Speak with us or begin your application today.
                      </p>
                      <div className="d-flex gap-3 justify-content-center flex-wrap" role="group" aria-label="Contact options">
                  <Link to="/contact" className="btn-navy" style={{
                    minHeight: '44px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    padding: '12px 32px',
                    borderRadius: '50px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    fontSize: '0.95rem',
                    background: 'white',
                    color: '#0d65fb',
                    border: '2px solid white'
                  }}>
                    Contact Admissions
                  </Link>
                  <Link to="/admissions/apply" className="btn-navy" style={{
                    minHeight: '44px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    padding: '12px 32px',
                    borderRadius: '50px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    fontSize: '0.95rem',
                    background: 'transparent',
                    color: 'white',
                    border: '2px solid white'
                  }}>
                    Apply Now
                  </Link>
                </div>
                </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Container>
      </section>

      <BlogDetailModal 
        show={showDetailModal}
        post={selectedPost}
        onClose={handleCloseDetailModal}
        onShare={handleShare}
      />

      <ShareModal 
        show={showShareModal} 
        onClose={() => setShowShareModal(false)} 
        post={selectedPost} 
        url={currentShareUrl} 
      />
    </>
  );
};

export default Blogs;