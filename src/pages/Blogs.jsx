// pages/Blogs.jsx - Professional Blog Page with Enhanced Design
import { Helmet } from "react-helmet-async";
import { Container, Row, Col, Spinner, Alert, Modal, Badge, Card } from "react-bootstrap";
import { useState, useCallback, useEffect, memo } from "react";
import { Link } from "react-router-dom";
import { FacebookShareButton, TwitterShareButton, WhatsappShareButton, LinkedinShareButton } from 'react-share';

// Remove unused imports: Button, useNavigate, useParams, useRef

// Optimized Image Component
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
    <div className="blog-image-wrapper" style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%',
      aspectRatio: '16/9',
      backgroundColor: '#f0f2f5',
      borderRadius: '20px',
      overflow: 'hidden'
    }}>
      {!loaded && (
        <div className="image-skeleton" style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          zIndex: 1,
          background: 'linear-gradient(90deg, #f0f2f5 25%, #e2e6ea 50%, #f0f2f5 75%)',
          backgroundSize: '200% 100%',
          animation: 'skeleton-loading 1.5s infinite'
        }} />
      )}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchpriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={className}
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover', 
          position: 'relative', 
          zIndex: 2,
          transition: 'transform 0.5s ease'
        }}
      />
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Share Modal Component
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
            <button className="share-btn facebook" aria-label="Share on Facebook">
              <i className="fab fa-facebook-f"></i>
            </button>
          </FacebookShareButton>
          
          <TwitterShareButton url={shareUrl} title={shareTitle}>
            <button className="share-btn twitter" aria-label="Share on Twitter">
              <i className="fab fa-twitter"></i>
            </button>
          </TwitterShareButton>
          
          <WhatsappShareButton url={shareUrl} title={shareTitle}>
            <button className="share-btn whatsapp" aria-label="Share on WhatsApp">
              <i className="fab fa-whatsapp"></i>
            </button>
          </WhatsappShareButton>
          
          <LinkedinShareButton url={shareUrl} title={shareTitle}>
            <button className="share-btn linkedin" aria-label="Share on LinkedIn">
              <i className="fab fa-linkedin-in"></i>
            </button>
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

// Blog Card Component
const BlogCard = memo(({ post, onClick }) => {
  const getReadingTime = (content) => {
    if (!content) return '3 min read';
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return `${Math.ceil(wordCount / wordsPerMinute)} min read`;
  };

  return (
    <div
      onClick={() => onClick(post)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(post); } }}
      role="article"
      tabIndex={0}
      className="blog-card"
      style={{
        overflow: 'hidden',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
        borderRadius: '24px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}
    >
      <div style={{ position: 'relative' }}>
        <OptimizedImage src={post.featuredImage || post.image} alt={post.title} />
        <Badge 
          bg="dark" 
          className="position-absolute top-0 start-0 m-3"
          style={{ 
            background: 'linear-gradient(135deg, #050265, #1a6bff)',
            padding: '0.35rem 1rem',
            borderRadius: '50px',
            fontSize: '0.7rem',
            fontWeight: '600',
            letterSpacing: '0.5px'
          }}
        >
          {post.category || "News"}
        </Badge>
      </div>
      
      <div className="blog-card-body" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="blog-meta" style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '0.75rem', 
          fontSize: '0.75rem', 
          color: '#718096',
          flexWrap: 'wrap'
        }}>
          <span><i className="far fa-calendar-alt me-1" style={{ color: '#ffd700' }}></i> {post.date}</span>
          <span><i className="far fa-clock me-1" style={{ color: '#ffd700' }}></i> {getReadingTime(post.content)}</span>
          <span><i className="far fa-user me-1" style={{ color: '#ffd700' }}></i> {post.author || "Admin"}</span>
        </div>
        
        <h3 className="blog-title" style={{ 
          fontSize: '1.25rem', 
          fontWeight: '700', 
          marginBottom: '0.75rem', 
          lineHeight: 1.3,
          color: '#050265',
          transition: 'color 0.3s ease'
        }}>
          {post.title}
        </h3>
        
        <p className="blog-excerpt" style={{ 
          fontSize: '0.9rem', 
          color: '#4a5568', 
          marginBottom: '1.25rem', 
          lineHeight: 1.6, 
          flex: 1 
        }}>
          {post.excerpt}
        </p>
        
        <button className="btn-navy">
          Read more 
          <i className="fas fa-arrow-right" style={{ transition: 'transform 0.3s ease', fontSize: '0.75rem' }}></i>
        </button>
      </div>
    </div>
  );
});

BlogCard.displayName = 'BlogCard';

// Category Filter Component
const CategoryFilter = memo(({ categories, selectedCategory, onSelect }) => {
  const allCategories = ["All", ...new Set(categories)];

  return (
    <div className="category-filter d-flex flex-wrap justify-content-center gap-2 mb-5">
      {allCategories.map(category => (
        <button
          key={category}
          onClick={() => onSelect(category === "All" ? null : category)}
          className={`category-btn ${selectedCategory === category || (category === "All" && !selectedCategory) ? 'active' : ''}`}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '50px',
            border: '1px solid rgba(5,2,101,0.2)',
            background: selectedCategory === category || (category === "All" && !selectedCategory) 
              ? 'linear-gradient(135deg, #050265, #1a6bff)' 
              : 'transparent',
            color: selectedCategory === category || (category === "All" && !selectedCategory) ? 'white' : '#050265',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          {category}
        </button>
      ))}
    </div>
  );
});

CategoryFilter.displayName = 'CategoryFilter';

// Full Blog Post Component
const FullBlogPost = memo(({ post, onBack, onShare }) => {
  if (!post) return null;
  
  return (
    <article className="full-blog-post" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <button 
        onClick={onBack} 
        className="back-button"
        style={{
          background: 'none',
          border: 'none',
          color: '#050265',
          padding: '0.5rem 0',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        <i className="fas fa-arrow-left"></i> Back to all articles
      </button>
      
      {post.featuredImage && (
        <div style={{ 
          width: '100%', 
          borderRadius: '24px', 
          overflow: 'hidden', 
          marginBottom: '2rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <img src={post.featuredImage} alt={post.title} style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
        </div>
      )}
      
      <div style={{ marginBottom: '2rem' }}>
        <Badge 
          bg="dark" 
          style={{ 
            background: 'linear-gradient(135deg, #050265, #1a6bff)',
            padding: '0.35rem 1rem',
            borderRadius: '50px',
            fontSize: '0.7rem',
            marginBottom: '1rem',
            display: 'inline-block'
          }}
        >
          {post.category || "News"}
        </Badge>
        
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', color: '#718096', fontSize: '0.85rem', flexWrap: 'wrap' }}>
          <span><i className="far fa-calendar-alt me-2" style={{ color: '#ffd700' }}></i> {post.date}</span>
          <span><i className="far fa-user me-2" style={{ color: '#ffd700' }}></i> By {post.author || "Kitale Progressive School"}</span>
          <span><i className="far fa-clock me-2" style={{ color: '#ffd700' }}></i> {post.readTime || "5 min read"}</span>
        </div>
        
        <h1 style={{ 
          fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', 
          fontWeight: '800', 
          color: '#050265', 
          marginBottom: '1rem',
          lineHeight: 1.2
        }}>
          {post.title}
        </h1>
      </div>
      
      <div className="blog-content" style={{ 
        fontSize: '1rem', 
        lineHeight: 1.8, 
        color: '#2d3748',
        fontFamily: 'Georgia, serif'
      }}>
        {post.content && <div dangerouslySetInnerHTML={{ __html: post.content }} />}
      </div>
      
      <div style={{ 
        marginTop: '3rem', 
        paddingTop: '2rem', 
        borderTop: '2px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h6 style={{ color: '#050265', marginBottom: '0.75rem', fontWeight: '600' }}>Share this article</h6>
          <div className="d-flex gap-2">
            <button onClick={onShare} className="share-icon-btn" aria-label="Share article">
              <i className="fas fa-share-alt"></i>
            </button>
          </div>
        </div>
        <button onClick={onBack} className="btn-navy" style={{ padding: '0.6rem 1.5rem' }}>
          More Articles
        </button>
      </div>
    </article>
  );
});

FullBlogPost.displayName = 'FullBlogPost';

function Blogs() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blogPosts, setBlogPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentShareUrl, setCurrentShareUrl] = useState('');

  // Fetch blog posts
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        // Simulate API fetch - replace with actual API call
        const posts = [
          {
            id: 1,
            slug: "importance-of-early-childhood-education",
            title: "The Importance of Early Childhood Education",
            excerpt: "Discover why the early years are crucial for your child's development and how our ECDE program nurtures young minds through play-based learning. Research shows that 90% of brain development happens before age 5.",
            content: `
              <h2>The Foundation of Lifelong Learning</h2>
              <p>The early years of a child's life are not just about learning ABCs and 123s. They are about building the neural connections that form the foundation for all future learning. At Kitale Progressive School, we understand that these formative years are critical, and our Early Childhood Development Education (ECDE) program is designed with this understanding at its core.</p>
              
              <h3>Why Early Childhood Education Matters</h3>
              <p>Research in neuroscience has shown that a child's brain develops most rapidly in the first five years of life. During this period, up to 90% of brain development occurs. This is when children develop cognitive skills, emotional regulation, social abilities, and the foundational knowledge that will support all future learning.</p>
              
              <h3>Our Approach at Kitale Progressive School</h3>
              <p>Our ECDE program is built on the understanding that young children learn best through play. We've developed a curriculum that integrates language, mathematics, environmental studies, creative arts, and social-emotional learning through engaging, play-based activities.</p>
            `,
            featuredImage: "/images/childhoodblog.jpg",
            author: "Ms. Jane Akinyi",
            date: "March 15, 2025",
            category: "Education",
            readTime: "5 min read"
          },
          {
            id: 2,
            slug: "preparing-child-for-boarding-school",
            title: "Preparing Your Child for Boarding School",
            excerpt: "A comprehensive guide for parents on how to prepare their children for a successful boarding school experience. Expert tips and practical advice for a smooth transition.",
            content: `
              <h2>Making the Transition to Boarding School a Positive Experience</h2>
              <p>The decision to send your child to boarding school is significant, filled with both excitement and anxiety. At Kitale Progressive School, we've helped hundreds of families navigate this transition successfully.</p>
              
              <h3>Understanding the Boarding Experience</h3>
              <p>Before preparing your child, it's helpful to understand what boarding school life actually looks like. At Kitale Progressive School, our boarding program is designed to be a home away from home, not just a place to sleep between classes.</p>
            `,
            featuredImage: "/images/boardingblog.webp",
            author: "Mr. Peter Mwangi",
            date: "March 10, 2025",
            category: "Parenting",
            readTime: "6 min read"
          },
          {
            id: 3,
            slug: "understanding-cbc-curriculum",
            title: "Understanding the CBC Curriculum",
            excerpt: "Everything you need to know about the Competency-Based Curriculum and how it benefits your child's learning journey. A complete breakdown for parents.",
            content: `
              <h2>A Comprehensive Guide to the Competency-Based Curriculum</h2>
              <p>Kenya's shift from the 8-4-4 system to the Competency-Based Curriculum (CBC) represents one of the most significant educational reforms in the country's history.</p>
              
              <h3>What is CBC?</h3>
              <p>The Competency-Based Curriculum is a modern approach to education that focuses on developing learners' abilities and potential rather than just academic content.</p>
            `,
            featuredImage: "/images/cbc-curriculumblog.jpg",
            author: "Mrs. Sarah Wanjiku",
            date: "March 5, 2025",
            category: "Academics",
            readTime: "7 min read"
          },
          {
            id: 4,
            slug: "extracurricular-activities-benefits",
            title: "The Benefits of Extracurricular Activities",
            excerpt: "How sports, arts, and clubs contribute to your child's holistic development beyond the classroom. Discover the transformative power of co-curricular engagement.",
            content: `<h2>Beyond the Classroom: The Power of Extracurriculars</h2><p>Education extends far beyond textbooks and examinations. At Kitale Progressive School, we believe that extracurricular activities are essential for developing well-rounded individuals.</p>`,
            featuredImage: "/images/optimized/gallery/sports2.webp",
            author: "Coach James Otieno",
            date: "February 28, 2025",
            category: "Co-Curricular",
            readTime: "4 min read"
          }
        ];
        setBlogPosts(posts);
        setLoading(false);
      } catch (err) {
        setError("Unable to load blog posts. Please try again later.");
        setLoading(false);
      }
    };
    fetchBlogPosts();
  }, []);

  const filteredPosts = selectedCategory 
    ? blogPosts.filter(post => post.category === selectedCategory)
    : blogPosts;

  const categories = blogPosts.map(post => post.category);

  const handleReadMore = (post) => {
    setSelectedPost(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setSelectedPost(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = (post) => {
    const url = `${window.location.origin}/blogs/${post.slug}`;
    setCurrentShareUrl(url);
    setShowShareModal(true);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>Blogs | Insights & Stories | Kitale Progressive School</title>
        <meta name="description" content="Explore insights, stories, and updates from Kitale Progressive School. Read our blog for parenting tips, educational guidance, and school life experiences." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </Helmet>

      {/* Hero Section */}
      <section className="blogs-hero-section" aria-labelledby="page-title">
        <div className="blogs-hero-content">
          <h1 id="page-title">BLOG</h1>
          <p>Educational Insights &amp; articles from Kitale Progressive school.</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="blog-main-section py-5" style={{ background: '#f8f9fa' }}>
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
          ) : selectedPost ? (
            <FullBlogPost post={selectedPost} onBack={handleBack} onShare={() => handleShare(selectedPost)} />
          ) : (
            <>
              <div className="text-center mb-5">
                <div className="parent-hook-badge" style={{ 
                  background: 'linear-gradient(135deg, #fff9e6, #fff4d4)',
                  display: 'inline-block', 
                  padding: '0.4rem 1.2rem', 
                  borderRadius: '50px', 
                  marginBottom: '1rem',
                  border: '1px solid rgba(255,215,0,0.3)'
                }}>
                  <i className="fas fa-lightbulb me-2" style={{ color: '#ffd700' }}></i> 
                  For Parents & Educators
                </div>
                <h2 className="section-heading mb-3" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.2rem)', color: '#050265' }}>
                  Discover, Learn, and Grow
                </h2>
                <p className="text-left text-muted" style={{ maxWidth: '700px', margin: '0 auto' }}>
                  Explore articles that help you understand your child's learning journey and how to support their growth.
                </p>
              </div>
              
              {/* Category Filter */}
              <CategoryFilter 
                categories={categories} 
                selectedCategory={selectedCategory} 
                onSelect={handleCategorySelect} 
              />
              
              {/* Blog Grid */}
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
            </>
          )}
        </Container>
      </section>

      {/* CTA SECTION - Using theme styling as requested */}
      <Container className="pb-5">
        <Row className="mt-5">
          <Col lg={8} className="mx-auto">
            <Card className="card-custom border-0 shadow-lg" style={{
              background: 'linear-gradient(135deg, #050265, #1a6bff)',
              color: 'white'
            }}>
              <Card.Body className="p-4 p-lg-5 text-center">
                <h3 className="h4 fw-bold mb-2 text-white">
                  Still Have Questions or Ready to Take the Next Step?
                </h3>
                <p className="mb-3 text-white opacity-90" style={{ fontSize: '0.95rem' }}>
                  Our admissions team is ready to guide you. Speak with us or begin your application today.
                </p>
                <div 
                  className="d-flex gap-3 justify-content-center flex-wrap"
                  role="group"
                  aria-label="Contact options"
                >
                  <Link
                    to="/contact"
                    className="btn-navy"
                    style={{
                      minHeight: '44px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none',
                      background: 'white',
                      color: '#050265',
                      padding: '12px 32px',
                      borderRadius: '50px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                    aria-label="Contact our admissions team"
                  >
                    Contact Admissions
                  </Link>

                  <Link
                    to="/admissions/apply"
                    className="btn-navy"
                    style={{
                      minHeight: '44px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none',
                      background: 'transparent',
                      color: 'white',
                      border: '2px solid white',
                      padding: '12px 32px',
                      borderRadius: '50px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                    aria-label="Apply for admission now"
                  >
                    Apply Now
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Share Modal */}
      <ShareModal show={showShareModal} onClose={() => setShowShareModal(false)} post={selectedPost} url={currentShareUrl} />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        .blogs-hero-section {
          position: relative;
          background: linear-gradient(135deg, #0d65fb 0%, #0a55d6 100%);
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
        }
        
        .blogs-hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url('/images/optimized/blog.webp');
          background-size: cover;
          background-position: center;
          transform: scale(1.05);
          opacity: 0.9;
          z-index: 0;
        }
        
        .blogs-hero-section::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(5,2,101,0.7), rgba(26,107,255,0.8));
          z-index: 1;
        }
        
        .blogs-hero-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
          padding: 80px 20px;
          color: white;
        }
        
        .blogs-hero-content .hero-badge {
          display: inline-block;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
          padding: 0.5rem 1.25rem;
          border-radius: 50px;
          font-size: 0.85rem;
        }
        
        .blogs-hero-content h1 {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800;
          margin-bottom: 1rem;
          text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        
        .blogs-hero-content p {
          font-size: clamp(1rem, 4vw, 1.2rem);
          opacity: 0.95;
        }
        
        .blog-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(5,2,101,0.15) !important;
        }
        
        .blog-card:hover .blog-title {
          color: #1a6bff;
        }
        
        .blog-card:hover .read-more-btn i {
          transform: translateX(5px);
        }
        
        .blog-card:hover img {
          transform: scale(1.05);
        }
        
        .share-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .share-btn.facebook { background: #1877f2; }
        .share-btn.twitter { background: #1da1f2; }
        .share-btn.whatsapp { background: #25d366; }
        .share-btn.linkedin { background: #0077b5; }
        
        .share-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .share-icon-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid #e5e7eb;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .share-icon-btn:hover {
          background: #ffd700;
          border-color: #ffd700;
          transform: scale(1.05);
        }
        
        .share-icon-btn:hover i {
          color: #050265;
        }
        
        .back-button:hover {
          gap: 0.75rem;
          color: #1a6bff;
        }
        
        .category-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(5,2,101,0.15);
        }
        
        .category-btn.active {
          box-shadow: 0 4px 12px rgba(5,2,101,0.3);
        }
        
        .btn-navy:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        @media (max-width: 768px) {
          .cta-title { font-size: 1.4rem; }
          .d-flex.gap-3 { flex-direction: column; align-items: stretch; }
          .d-flex.gap-3 a { width: 100%; text-align: center; }
        }
        
        @media (prefers-reduced-motion: reduce) {
          *, .blog-card, .share-btn, .share-icon-btn, .category-btn {
            transition: none !important;
            transform: none !important;
          }
          .blog-card:hover img { transform: none; }
        }
      `}} />
    </>
  );
}

export default memo(Blogs);