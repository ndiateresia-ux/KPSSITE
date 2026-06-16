// pages/Blogs.jsx - Complete Working Version
import React, { useState, useEffect, useCallback, memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Row, Col, Spinner, Alert, Modal, Badge, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FacebookShareButton, TwitterShareButton, WhatsappShareButton, LinkedinShareButton } from 'react-share';

// ==================== INITIAL DATA ====================
const INITIAL_BLOGS = [
  {
    id: 1,
    slug: "annual-sports-day-2024",
    title: "Annual Sports Day 2024: A Celebration of Talent",
    excerpt: "Students showcased exceptional athletic abilities during our annual sports day event with record-breaking performances across all categories.",
    content: "<p>The annual sports day was a spectacular event filled with excitement and competition. Students from all grades participated in various athletic events including track races, field events, and team sports.</p><p>The day began with a colorful parade followed by the lighting of the torch. Students competed fiercely but with great sportsmanship, making it a memorable day for everyone involved.</p>",
    fullStory: "<p>Students from all grades participated in various athletic events including 100m sprints, long jump, high jump, relay races, and football matches. The school's sports teams demonstrated exceptional skills and teamwork.</p><p>Special recognition was given to the top performers who broke school records. The event concluded with an awards ceremony where medals and certificates were presented to the winners.</p>",
    featuredImage: "/images/optimized/gallery/sports1.webp",
    author: "Mr. Omondi",
    date: "2024-12-01",
    category: "School Event",
    tags: ["sports", "competition", "students"]
  },
  {
    id: 2,
    slug: "excellence-in-cbc-grade-6",
    title: "Excellence in CBC: Our Grade 6 Learners Shine",
    excerpt: "Our Grade 6 learners demonstrated outstanding performance in the recent CBC assessments with remarkable scores in all competency areas.",
    content: "<p>The Competency-Based Curriculum has transformed how our students learn and grow. Our Grade 6 learners have shown remarkable progress in all competency areas including literacy, numeracy, and life skills.</p><p>Parents and teachers have been impressed with the holistic development of the learners, who are now better prepared for higher education and life challenges.</p>",
    fullStory: "<p>Our Grade 6 learners have shown remarkable progress in all competency areas including literacy, numeracy, creativity, and critical thinking. The CBC approach has fostered independent learning and problem-solving skills.</p><p>The school has invested in modern teaching resources and teacher training to ensure effective implementation of the curriculum. Regular assessments and feedback help track learner progress and identify areas for improvement.</p>",
    featuredImage: "/images/optimized/academics1.webp",
    author: "Madam Sarah",
    date: "2024-11-15",
    category: "Academic Achievement",
    tags: ["CBC", "education", "achievement"]
  },
  {
    id: 3,
    slug: "student-council-elections-2024",
    title: "Building Future Leaders: Student Council Elections",
    excerpt: "Democracy in action as our students participated in the annual student council elections with great enthusiasm and civic awareness.",
    content: "<p>The student council elections provide valuable leadership experience for our learners. Candidates presented their manifestos and campaigned across the school, showcasing their leadership qualities.</p><p>Students exercised their democratic rights by voting for their preferred candidates, making this a practical lesson in democracy and civic responsibility.</p>",
    fullStory: "<p>Candidates presented their manifestos and campaigned across the school, sharing their vision for improving student welfare and school activities. The election process was conducted with transparency and fairness.</p><p>The newly elected student council will work closely with the school administration to implement student-led initiatives and represent student interests. This experience helps develop essential leadership and communication skills.</p>",
    featuredImage: "/images/optimized/gallery/events3.webp",
    author: "Mr. Kipchoge",
    date: "2024-10-20",
    category: "Student Leadership",
    tags: ["leadership", "democracy", "students"]
  },
  {
    id: 4,
    slug: "science-fair-2024",
    title: "Innovation Showcase: Annual Science Fair 2024",
    excerpt: "Young scientists impressed everyone with their innovative projects addressing real-world challenges through creative scientific solutions.",
    content: "<p>The annual science fair showcased the creativity and scientific thinking of our students. Projects ranged from environmental conservation to technology solutions for everyday problems.</p><p>Students demonstrated their research skills and presented their findings to judges and visitors, showing how science can solve real-world problems.</p>",
    fullStory: "<p>Projects ranged from environmental conservation to technology solutions for everyday problems. Winners received special recognition and will represent the school at the regional science competition.</p><p>The science fair has become a platform for nurturing young scientists and innovators. Students are encouraged to think critically and apply scientific principles to address community challenges.</p>",
    featuredImage: "/images/optimized/gallery/science1.webp",
    author: "Dr. Mwangi",
    date: "2024-09-28",
    category: "STEM",
    tags: ["science", "innovation", "STEM"]
  },
  {
    id: 5,
    slug: "culture-day-celebration",
    title: "Celebrating Diversity: Cultural Day 2024",
    excerpt: "Students showcased Kenya's rich cultural heritage through music, dance, traditional cuisine, and colorful attire from various communities.",
    content: "<p>Cultural Day was a vibrant celebration of Kenya's diverse cultural heritage. Students and staff dressed in traditional attire representing various Kenyan communities.</p><p>The event featured traditional dances, music performances, storytelling, and a food fair where parents and students shared traditional dishes.</p>",
    fullStory: "<p>The event featured traditional dances, music performances, storytelling, and a food fair where parents and students shared traditional dishes. This celebration promotes cultural understanding and national unity.</p><p>Parents were invited to participate and share their cultural knowledge with students. The event was a powerful reminder of the beauty in diversity and the importance of preserving cultural heritage.</p>",
    featuredImage: "/images/optimized/gallery/culture1.webp",
    author: "Madam Grace",
    date: "2024-09-15",
    category: "Cultural Event",
    tags: ["culture", "diversity", "celebration"]
  }
];

// ==================== UTILITY FUNCTIONS ====================
const getReadingTime = (content) => {
  if (!content) return '3 min read';
  const plainText = content.replace(/<[^>]*>/g, '');
  const wordCount = plainText.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / 200);
  return `${minutes || 1} min read`;
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
const loadBlogsFromStorage = () => {
  try {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('admin_blogs');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log('Blogs loaded from localStorage:', parsed.length);
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error parsing blogs from localStorage:', e);
  }
  return null;
};

const saveBlogsToStorage = (blogs) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_blogs', JSON.stringify(blogs));
      return true;
    }
  } catch (e) {
    console.error('Error saving blogs to localStorage:', e);
  }
  return false;
};

const initializeBlogs = () => {
  // Try to load from localStorage first
  const stored = loadBlogsFromStorage();
  if (stored) {
    return stored;
  }
  
  // If no stored data, save initial data and return it
  console.log('No stored blogs found, initializing with default data');
  saveBlogsToStorage(INITIAL_BLOGS);
  return INITIAL_BLOGS;
};

// ==================== CONTENT RENDERER ====================
const renderContent = (content) => {
  if (!content) return '';
  
  // If already has HTML tags, return as is
  if (/<[a-z][\s\S]*>/i.test(content)) {
    return content;
  }
  
  // Convert markdown-like text to HTML
  let html = content;
  html = html.replace(/^# (.*?)(?:\n|$)/gm, '<h2>$1</h2>');
  html = html.replace(/^## (.*?)(?:\n|$)/gm, '<h3>$1</h3>');
  html = html.replace(/^### (.*?)(?:\n|$)/gm, '<h4>$1</h4>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Wrap paragraphs
  const paragraphs = html.split('\n\n').filter(p => p.trim());
  html = paragraphs
    .map(para => {
      const trimmed = para.trim();
      if (/^<h[1-6]/.test(trimmed) || /^<p>/.test(trimmed)) {
        return trimmed;
      }
      return `<p>${trimmed}</p>`;
    })
    .filter(Boolean)
    .join('\n');
  
  return html;
};

// ==================== OPTIMIZED IMAGE COMPONENT ====================
const OptimizedImage = memo(({ src, alt, className = "" }) => {
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
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setError(true)}
      className={`curriculum-image ${className}`}
      style={{ width: '100%', height: 'auto', borderRadius: '20px 20px 0 0' }}
    />
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
    <Modal show={show} onHide={onClose} centered size="sm" className="share-modal">
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

// ==================== BLOG CARD COMPONENT ====================
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
      style={{
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
        background: 'white',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div className="position-relative">
        <OptimizedImage 
          src={post.featuredImage || post.image || '/images/placeholder.jpg'} 
          alt={post.title} 
        />
        <Badge 
          bg="dark" 
          className="position-absolute top-0 start-0 m-3 blog-badge"
          style={{
            background: '#050265',
            padding: '8px 16px',
            borderRadius: '50px',
            fontWeight: '600',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          {post.category || "News"}
        </Badge>
      </div>
      
      <div className="blog-card-body" style={{ padding: '1.5rem', flex: '1', display: 'flex', flexDirection: 'column' }}>
        <div className="blog-meta" style={{ 
          display: 'flex', 
          gap: '1rem', 
          fontSize: '0.75rem', 
          color: '#666',
          marginBottom: '0.75rem',
          flexWrap: 'wrap'
        }}>
          <span><i className="far fa-calendar-alt me-1"></i> {formatShortDate(post.date) || 'Recent'}</span>
          <span><i className="far fa-clock me-1"></i> {getReadingTime(post.content)}</span>
          <span><i className="far fa-user me-1"></i> {post.author || "Admin"}</span>
        </div>
        
        <h3 className="blog-title" style={{
          fontSize: '1.15rem',
          fontWeight: '700',
          color: '#050265',
          marginBottom: '0.75rem',
          lineHeight: '1.3',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {post.title || 'Untitled Post'}
        </h3>
        
        <p className="blog-excerpt" style={{
          color: '#555',
          fontSize: '0.9rem',
          lineHeight: '1.6',
          flex: '1',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          marginBottom: '1rem'
        }}>
          {post.excerpt || getPlainExcerpt(post.content)}
        </p>
        
        <button 
          className="btn-navy read-more-btn" 
          onClick={(e) => { e.stopPropagation(); handleClick(); }}
          style={{
            background: '#050265',
            color: 'white',
            border: 'none',
            padding: '8px 20px',
            borderRadius: '50px',
            fontWeight: '600',
            fontSize: '0.85rem',
            transition: 'all 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            alignSelf: 'flex-start',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ffd700';
            e.currentTarget.style.color = '#050265';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#050265';
            e.currentTarget.style.color = 'white';
          }}
        >
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
  const allCategories = ["All", ...new Set(categories.filter(Boolean))];

  return (
    <div className="category-filter" style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.75rem',
      justifyContent: 'center',
      marginBottom: '2.5rem'
    }}>
      {allCategories.map(category => (
        <button
          key={category}
          onClick={() => onSelect(category === "All" ? null : category)}
          className={`category-btn ${selectedCategory === category || (category === "All" && !selectedCategory) ? 'active' : ''}`}
          style={{
            padding: '8px 20px',
            borderRadius: '50px',
            border: '2px solid #e0e0e0',
            background: selectedCategory === category || (category === "All" && !selectedCategory) ? '#050265' : 'white',
            color: selectedCategory === category || (category === "All" && !selectedCategory) ? 'white' : '#050265',
            fontWeight: '600',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            borderColor: selectedCategory === category || (category === "All" && !selectedCategory) ? '#050265' : '#e0e0e0'
          }}
          onMouseEnter={(e) => {
            if (!(selectedCategory === category || (category === "All" && !selectedCategory))) {
              e.currentTarget.style.borderColor = '#050265';
            }
          }}
          onMouseLeave={(e) => {
            if (!(selectedCategory === category || (category === "All" && !selectedCategory))) {
              e.currentTarget.style.borderColor = '#e0e0e0';
            }
          }}
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
      <Modal.Header closeButton style={{ borderBottom: '2px solid #f0f0f0', padding: '1.5rem' }}>
        <Modal.Title style={{ color: '#050265', fontWeight: '700' }}>{post.title}</Modal.Title>
      </Modal.Header>
      
      <Modal.Body style={{ padding: '2rem' }}>
        {post.featuredImage && (
          <div className="mb-4 image-shadow blog-featured-image" style={{ borderRadius: '12px', overflow: 'hidden' }}>
            <img 
              src={post.featuredImage} 
              alt={post.title} 
              className="img-fluid"
              style={{ width: '100%', height: 'auto' }}
              onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
            />
          </div>
        )}

        <div className="blog-meta-detail" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          padding: '1rem 0',
          borderBottom: '1px solid #f0f0f0',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          <span><i className="far fa-calendar-alt me-2"></i> {formatDate(post.date)}</span>
          <span><i className="far fa-user me-2"></i> By {post.author || "Admin"}</span>
          <span><i className="fas fa-tag me-2"></i> {post.category}</span>
          <span><i className="far fa-clock me-2"></i> {getReadingTime(post.content)}</span>
        </div>

        <div className="blog-content-consistent" style={{ fontSize: '1rem', lineHeight: '1.8', color: '#333' }}>
          {renderedContent ? (
            <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
          ) : (
            <p>{post.excerpt}</p>
          )}
          
          {renderedFullStory && (
            <>
              <hr className="my-4" />
              <h5 className="fw-bold mb-3" style={{ color: '#050265' }}>More Details</h5>
              <div dangerouslySetInnerHTML={{ __html: renderedFullStory }} />
            </>
          )}
        </div>
      </Modal.Body>
      
      <Modal.Footer style={{ borderTop: '2px solid #f0f0f0', padding: '1.5rem', flexWrap: 'wrap' }}>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="fw-semibold share-label" style={{ color: '#050265' }}>Share:</span>
          
          <FacebookShareButton url={window.location.href} quote={post.title}>
            <span className="share-icon-btn facebook" role="button" aria-label="Share on Facebook" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#1877f2',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              <i className="fab fa-facebook-f"></i>
            </span>
          </FacebookShareButton>
          
          <TwitterShareButton url={window.location.href} title={post.title}>
            <span className="share-icon-btn twitter" role="button" aria-label="Share on Twitter" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#000000',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              <i className="fab fa-twitter"></i>
            </span>
          </TwitterShareButton>
          
          <WhatsappShareButton url={window.location.href} title={post.title}>
            <span className="share-icon-btn whatsapp" role="button" aria-label="Share on WhatsApp" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#25D366',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              <i className="fab fa-whatsapp"></i>
            </span>
          </WhatsappShareButton>
          
          <LinkedinShareButton url={window.location.href} title={post.title}>
            <span className="share-icon-btn linkedin" role="button" aria-label="Share on LinkedIn" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#0A66C2',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              <i className="fab fa-linkedin-in"></i>
            </span>
          </LinkedinShareButton>
          
          <span 
            onClick={() => onShare(post)} 
            className="share-icon-btn copy-link"
            role="button"
            aria-label="Copy link"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#050265',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <i className="fas fa-link"></i>
          </span>
        </div>
        <button 
          onClick={onClose} 
          className="btn-outline-navy"
          style={{
            padding: '8px 24px',
            borderRadius: '50px',
            border: '2px solid #050265',
            background: 'transparent',
            color: '#050265',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#050265';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#050265';
          }}
        >
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
});

BlogDetailModal.displayName = 'BlogDetailModal';

// ==================== BLOG SECTION COMPONENT (For Home Page) ====================
export const BlogSection = ({ limit = 3, showViewAll = true, variant = 'gold' }) => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentShareUrl, setCurrentShareUrl] = useState('');

  const loadPosts = useCallback(() => {
    setLoading(true);
    try {
      // Always initialize to ensure data exists
      const posts = initializeBlogs();
      const limitedPosts = limit ? posts.slice(0, limit) : posts;
      setBlogPosts(limitedPosts);
      setError(null);
      console.log('BlogSection loaded:', limitedPosts.length, 'posts');
    } catch (err) {
      console.error('Error loading blog posts:', err);
      setError('Unable to load blog posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadPosts();

    // Listen for storage changes (from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'admin_blogs') {
        console.log('BlogSection: Storage changed, reloading...');
        loadPosts();
      }
    };

    // Listen for custom events (from admin panel)
    const handleAdminDataChange = (e) => {
      if (e.detail?.key === 'admin_blogs') {
        console.log('BlogSection: Admin data changed, reloading...');
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

  if (loading) {
    return (
      <section className="section-padding bg-light-custom">
        <Container>
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
            <p className="mt-3 text-muted">Loading latest posts...</p>
          </div>
        </Container>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section-padding bg-light-custom">
        <Container>
          <Alert variant="warning" className="text-center">{error}</Alert>
        </Container>
      </section>
    );
  }

  return (
    <>
      <section id="blog-section" className="section-padding bg-light-custom">
        <Container>
          <div className="text-center mb-5">
            <div className="blog-section-badge" style={{
              display: 'inline-block',
              background: '#050265',
              color: 'white',
              padding: '8px 24px',
              borderRadius: '50px',
              fontSize: '0.85rem',
              fontWeight: '600',
              marginBottom: '1rem'
            }}>
              <span aria-hidden="true">📝</span>
              <span className="fw-bold text-white"> Latest News</span>
            </div>
            <h2 id="blog-heading" className="section-heading py-3" style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#050265',
              marginBottom: '0.5rem'
            }}>
              Stay Updated with Our School Community
            </h2>
            <p className="text-muted blog-subtitle" style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              Discover insights, stories, and updates from Kitale Progressive School
            </p>
          </div>

          {blogPosts.length > 0 ? (
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
                    <button className="btn-navy" style={{
                      background: '#050265',
                      color: 'white',
                      border: 'none',
                      padding: '12px 40px',
                      borderRadius: '50px',
                      fontWeight: '600',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#ffd700';
                      e.currentTarget.style.color = '#050265';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#050265';
                      e.currentTarget.style.color = 'white';
                    }}>
                      View All News & Updates
                    </button>
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

// ==================== MAIN BLOGS PAGE COMPONENT ====================
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
      const posts = initializeBlogs();
      setBlogPosts(posts);
      setError(null);
      console.log('Blogs page loaded:', posts.length, 'posts');
    } catch (err) {
      console.error('Error loading blog posts:', err);
      setError("Unable to load blog posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();

    const handleStorageChange = (e) => {
      if (e.key === 'admin_blogs') {
        console.log('Blogs page: Storage changed, reloading...');
        loadPosts();
      }
    };

    const handleAdminDataChange = (e) => {
      if (e.detail?.key === 'admin_blogs') {
        console.log('Blogs page: Admin data changed, reloading...');
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

  const categories = blogPosts.map(post => post.category).filter(Boolean);

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

      <section className="blogs-hero-section" style={{
        background: 'linear-gradient(135deg, #050265 0%, #0d65fb 100%)',
        padding: '80px 0',
        textAlign: 'center',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="blogs-hero-content" style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1rem' }}>BLOG</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            Educational Insights &amp; Articles from Kitale Progressive School
          </p>
        </div>
      </section>

      <section className="blog-main-section py-5 bg-light-custom" style={{ background: '#f8f9fa' }}>
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
                <div className="parent-hook-badge" style={{
                  display: 'inline-block',
                  background: '#ffd700',
                  color: '#050265',
                  padding: '8px 24px',
                  borderRadius: '50px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  marginBottom: '1rem'
                }}>
                  <i className="fas fa-lightbulb me-2"></i> 
                  For Parents & Educators
                </div>
                <h2 className="section-heading mb-3" style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: '#050265'
                }}>
                  Discover, Learn, and Grow
                </h2>
                <p className="text-muted blog-subtitle" style={{
                  fontSize: '1.1rem',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}>
                  Explore articles that help you understand your child's learning journey and how to support their growth.
                </p>
              </div>
              
              {blogPosts.length > 0 && (
                <CategoryFilter 
                  categories={categories} 
                  selectedCategory={selectedCategory} 
                  onSelect={handleCategorySelect} 
                />
              )}
              
              {filteredPosts.length > 0 ? (
                <Row className="g-4">
                  {filteredPosts.map(post => (
                    <Col key={post.id} md={6} lg={4}>
                      <BlogCard post={post} onClick={handleReadMore} />
                    </Col>
                  ))}
                </Row>
              ) : (
                <div className="text-center py-5">
                  <i className="fas fa-search" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                  <h4 className="mt-3 text-muted">No posts found</h4>
                  <p>Try selecting a different category</p>
                  <button 
                    onClick={() => handleCategorySelect(null)} 
                    className="btn-navy"
                    style={{
                      background: '#050265',
                      color: 'white',
                      border: 'none',
                      padding: '10px 30px',
                      borderRadius: '50px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#ffd700';
                      e.currentTarget.style.color = '#050265';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#050265';
                      e.currentTarget.style.color = 'white';
                    }}
                  >
                    View All Posts
                  </button>
                </div>
              )}

              <Row className="mt-5">
                <Col lg={8} className="mx-auto">
                  <Card className="card-custom border-0 shadow-lg blog-cta-card" style={{
                    background: 'linear-gradient(135deg, #050265 0%, #0d65fb 100%)',
                    borderRadius: '20px',
                    overflow: 'hidden'
                  }}>
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
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#ffd700';
                          e.currentTarget.style.color = '#050265';
                          e.currentTarget.style.borderColor = '#ffd700';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.color = '#0d65fb';
                          e.currentTarget.style.borderColor = 'white';
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
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.color = '#050265';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'white';
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