// components/BlogSection.jsx - Fully Integrated with Theme CSS
import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert, Modal, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Optimized Image Component with theme classes
const OptimizedImage = ({ src, alt, priority = false }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div 
        className="bg-light-custom d-flex align-items-center justify-content-center"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '200px',
          borderRadius: '16px'
        }}
        role="img"
        aria-label={`${alt} (image coming soon)`}
      >
        <div className="text-center">
          <div style={{ fontSize: '2rem' }} aria-hidden="true">📝</div>
          <div className="text-dark small">{alt}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="curriculum-image-wrapper" style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%',
      aspectRatio: '16/9',
      backgroundColor: 'var(--gray-light)',
      borderRadius: '16px',
      overflow: 'hidden'
    }}>
      {!loaded && (
        <div 
          className="image-skeleton"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1
          }}
          aria-hidden="true"
        />
      )}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchpriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`curriculum-image ${loaded ? 'loaded' : ''}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'relative',
          zIndex: 2
        }}
      />
    </div>
  );
};

const BlogSection = ({ limit, showViewAll, variant, showHeadingLine = true }) => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Color variants using theme variables
  const variants = {
    gold: {
      primary: '#0d65fb',
      secondary: '#0d65fb',
      background: 'linear-gradient(135deg, #fff9e6 0%, var(--white) 100%)',
      light: 'rgba(255,0,128,0.1)',
      badge: 'var(--gold)'
    },
    navy: {
      primary: '#0d65fb',
      secondary: '#0d65fb',
      background: 'linear-gradient(135deg, var(--gray-light) 0%, var(--white) 100%)',
      light: 'rgba(13,101,251,0.1)',
      badge: 'var(--navy)'
    }
  };

  const colors = variants[variant] || variants.gold;

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        const mockPosts = [
          {
            id: 1,
            title: "Annual Sports Day 2024: A Celebration of Talent",
            excerpt: "Students showcased exceptional athletic abilities during our annual sports day event. From track events to team sports, it was a day filled with excitement and sportsmanship.",
            content: "Students showcased exceptional athletic abilities during our annual sports day event. From track events to team sports, it was a day filled with excitement and sportsmanship. Parents and teachers cheered as young athletes competed in various categories, demonstrating teamwork, determination, and school spirit.",
            fullStory: "The event was graced by the County Director of Education who commended the school for nurturing talent. Over 30 schools participated in various competitions. Our school emerged winners in football, athletics, and netball categories. The event also featured a special parade by the school band and cultural performances by the music club. Parents expressed their appreciation for the school's commitment to holistic education.",
            date: "2024-03-15",
            author: "Mr. Omondi",
            category: "School Event",
            featuredImage: "/images/optimized/gallery/sports1.webp",
            slug: "annual-sports-day-2024"
          },
          {
            id: 2,
            title: "Excellence in CBC: Our Grade 6 Learners Shine",
            excerpt: "Our Grade 6 learners demonstrated outstanding performance in the recent CBC assessments, showcasing the effectiveness of our competency-based curriculum approach.",
            content: "Our Grade 6 learners demonstrated outstanding performance in the recent CBC assessments, showcasing the effectiveness of our competency-based curriculum approach. Teachers attribute this success to our focus on individualized learning and continuous assessment.",
            fullStory: "The Kenya National Examinations Council praised our school for exemplary performance in the CBC assessments. Our Grade 6 learners scored above the national average in all subjects, with special recognition in Mathematics and Science. The school's innovative teaching methods and small class sizes were highlighted as key factors in this success.",
            date: "2024-03-10",
            author: "Madam Sarah",
            category: "Academic Achievement",
            featuredImage: "/images/optimized/gallery/academics1.webp",
            slug: "cbc-excellence-grade-6"
          },
          {
            id: 3,
            title: "Building Future Leaders: Student Council Elections",
            excerpt: "Democracy in action as our students participated in the annual student council elections, learning valuable lessons in leadership and civic responsibility.",
            content: "Democracy in action as our students participated in the annual student council elections, learning valuable lessons in leadership and civic responsibility. Candidates presented their manifestos, debated important issues, and campaigned respectfully.",
            fullStory: "The election process was overseen by the Social Studies department, ensuring fairness and transparency. Voter turnout was an impressive 85%, demonstrating strong student engagement. The newly elected council has already begun implementing their campaign promises, including a student suggestion box and monthly forums with school administration.",
            date: "2024-03-05",
            author: "Mr. Kipchoge",
            category: "Student Leadership",
            featuredImage: "/images/optimized/gallery/events4.webp",
            slug: "student-council-elections"
          }
        ];

        setTimeout(() => {
          const posts = limit ? mockPosts.slice(0, limit) : mockPosts;
          setBlogPosts(posts);
          setLoading(false);
        }, 800);
        
      } catch (err) {
        setError('Unable to load blog posts. Please try again later.');
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, [limit]);

  const handleReadMore = (post) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPost(null);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatShortDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Blog Card Component with theme classes
  const BlogCard = ({ post }) => (
    <div
      onClick={() => handleReadMore(post)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleReadMore(post);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Read more about ${post.title}`}
      className="card-custom blog-card"
      style={{
        overflow: 'hidden',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease'
      }}
    >
      {/* Image Container */}
      <div className="curriculum-image-wrapper" style={{ 
        aspectRatio: '16/9',
        backgroundColor: 'var(--gray-light)',
        position: 'relative'
      }}>
        {post.featuredImage ? (
          <OptimizedImage 
            src={post.featuredImage} 
            alt={post.title}
            priority={post.id === 1}
          />
        ) : (
          <div className="bg-navy d-flex align-items-center justify-content-center" style={{ height: '100%' }}>
            <span style={{ fontSize: '3rem', color: 'var(--gold)' }} aria-hidden="true">📝</span>
          </div>
        )}
        
        {/* Date Badge */}
        {post.date && (
          <div className="image-tag" style={{
            top: '1rem',
            right: '1rem',
            left: 'auto',
            bottom: 'auto',
            background: colors.badge,
            color: variant === 'gold' ? 'var(--navy)' : 'var(--white)',
            padding: '0.35rem 1rem',
            fontSize: '0.75rem'
          }}>
            {formatShortDate(post.date)}
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-4 d-flex flex-column flex-grow-1">
        {/* Category Tag */}
        {post.category && (
          <span className="curriculum-badge" style={{
            background: colors.light,
            color: colors.primary,
            fontSize: '0.7rem',
            padding: '4px 12px',
            marginBottom: '1rem',
            alignSelf: 'flex-start',
            borderRadius: '30px'
          }}>
            {post.category}
          </span>
        )}

        {/* Title */}
        <h3 className="card-title-navy h5 fw-bold mb-3" style={{ lineHeight: 1.4 }}>
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-dark small mb-3 flex-grow-1" style={{ lineHeight: 1.6 }}>
          {post.excerpt || (post.content && post.content.substring(0, 120) + '...')}
        </p>

        {/* Author and Read More */}
        <div className="d-flex justify-content-between align-items-center pt-3 mt-auto" style={{ borderTop: '1px solid rgba(13,101,251,0.1)' }}>
          {post.author && (
            <span className="text-muted small d-flex align-items-center gap-2">
              <span className="fw-semibold text-navy">By</span> {post.author}
            </span>
          )}
          <span className="text-gold fw-semibold small d-flex align-items-center gap-1">
            Read More
            <span style={{ fontSize: '1rem' }} aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <section id="blog-section" className="section-padding" style={{ 
       
      }} aria-labelledby="blog-heading">
        <Container>
          <div className="text-center mb-5">
            <div className="d-inline-flex align-items-center gap-2 mb-4" style={{
              background: colors.primary,
              padding: '0.5rem 1.5rem',
              borderRadius: '40px'
            }}>
              <span style={{ fontSize: '1.2rem' }} aria-hidden="true">📝</span>
              <span className="fw-bold" style={{ 
                color: variant === 'gold' ? 'var(--navy)' : 'var(--white)',
                fontSize: '0.9rem'
              }}>
                Latest News and School Events
              </span>
            </div>
            <h2 id="blog-heading" className="section-heading">
              Stay Updated with Our School Community
            </h2>
            <p className="lead text-muted" style={{ maxWidth: '700px', margin: '0 auto' }}>
              Discover insights, stories, and updates from Kitale Progressive School
            </p>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading latest posts...</p>
            </div>
          ) : error ? (
            <Alert variant="warning" className="text-center">
              {error}
            </Alert>
          ) : blogPosts.length > 0 ? (
            <>
              <Row className="g-4" role="list" aria-label="Blog posts">
                {blogPosts.map((post) => (
                  <Col key={post.id} md={6} lg={4} role="listitem">
                    <BlogCard post={post} />
                  </Col>
                ))}
              </Row>

              {/* View All Button */}
              {showViewAll && (
                <div className="text-center mt-5">
                  <Link to="/school-life/news#blog-section">
                    <button
                      className="btn-navy"
                      style={{
                        padding: '0.75rem 2.5rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        borderRadius: '40px',
                        minHeight: '48px'
                      }}
                    >
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

      {/* Full Story Modal with theme */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal}
        size="lg"
        centered
        dialogClassName="blog-modal"
      >
        {selectedPost && (
          <>
            <Modal.Header closeButton style={{ 
              borderBottom: `2px solid ${colors.primary}`,
              padding: '1.5rem 2rem',
              backgroundColor: 'var(--white)'
            }}>
              <Modal.Title className="card-title-navy h4 fw-bold">
                {selectedPost.title}
              </Modal.Title>
            </Modal.Header>
            
            <Modal.Body style={{ padding: '2rem', backgroundColor: 'var(--white)' }}>
              {/* Featured Image in Modal */}
              {selectedPost.featuredImage && (
                <div className="curriculum-image-wrapper mb-4" style={{ borderRadius: '16px' }}>
                  <img 
                    src={selectedPost.featuredImage} 
                    alt={selectedPost.title}
                    className="curriculum-image loaded"
                    style={{
                      width: '100%',
                      height: 'auto',
                      objectFit: 'cover',
                      borderRadius: '16px'
                    }}
                  />
                </div>
              )}

              {/* Meta Info */}
              <div className="d-flex gap-4 mb-4 flex-wrap">
                <span className="d-flex align-items-center gap-2 text-muted small">
                  <span className="text-gold">📅</span> 
                  {formatDate(selectedPost.date)}
                </span>
                <span className="d-flex align-items-center gap-2 text-muted small">
                  <span className="text-gold">✍️</span> 
                  By {selectedPost.author}
                </span>
                <span className="d-flex align-items-center gap-2 text-muted small">
                  <span className="text-gold">🏷️</span> 
                  {selectedPost.category}
                </span>
              </div>

              {/* Full Content */}
              <div className="blog-content" style={{
                fontSize: '1rem',
                lineHeight: 1.8,
                color: 'var(--text-dark)'
              }}>
                <p className="mb-4">{selectedPost.content}</p>
                
                {selectedPost.fullStory && (
                  <>
                    <hr className="my-4" style={{ borderColor: colors.light }} />
                    <h4 className="card-title-navy h5 fw-bold mb-3">More Details</h4>
                    <p>{selectedPost.fullStory}</p>
                  </>
                )}
              </div>
            </Modal.Body>
            
            <Modal.Footer style={{ 
              borderTop: `1px solid ${colors.light}`,
              padding: '1rem 2rem',
              backgroundColor: 'var(--white)'
            }}>
              <button 
                onClick={handleCloseModal}
                className="btn-outline-navy"
                style={{
                  padding: '0.5rem 2rem',
                  borderRadius: '40px',
                  fontWeight: '600',
                  minHeight: '44px'
                }}
              >
                Close
              </button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        .blog-card {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
        }
        .blog-card:hover,
        .blog-card:focus-visible {
          transform: translateY(-6px);
          box-shadow: 0 15px 35px rgba(10, 85, 216, 0.15) !important;
          outline: 3px solid var(--gold);
          outline-offset: 2px;
        }
        .blog-modal .modal-content {
          border-radius: 20px;
          overflow: hidden;
          border: none;
        }
        .blog-modal .modal-header .btn-close {
          background-color: var(--gray-light);
          border-radius: 50%;
          padding: 0.5rem;
          opacity: 1;
          transition: all 0.2s ease;
        }
        .blog-modal .modal-header .btn-close:hover {
          background-color: var(--gold);
          transform: scale(1.1);
        }
        @media (max-width: 768px) {
          .section-heading {
            font-size: 1.8rem;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .blog-card,
          .blog-card:hover,
          .blog-card:focus-visible {
            transition: none !important;
            transform: none !important;
          }
        }
      `}} />
    </>
  );
};

export default BlogSection;