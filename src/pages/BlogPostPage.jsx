// src/pages/BlogPostPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { ArrowLeft, Calendar, User, Tag, Clock } from 'react-feather';

// Helper function for image fallback
const getLocalPlaceholder = (text, width = 1200, height = 400) => {
  const encodedText = encodeURIComponent(text.substring(0, 20));
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect width='100%25' height='100%25' fill='%23132f66'/%3E%3Ctext x='50%25' y='50%25' font-size='${Math.min(width/15, 24)}' text-anchor='middle' dy='.3em' fill='%23cebd04' font-weight='bold'%3E${encodedText}%3C/text%3E%3C/svg%3E`;
};

// Helper function for reading time
const getReadingTime = (content) => {
  if (!content) return '1 min read';
  const wordsPerMinute = 200;
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
};

const BlogPostPage = () => {
  const location = useLocation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = location.state?.post;
  const [isLoading, setIsLoading] = useState(true);

  // Handle missing post - redirect to news page
  useEffect(() => {
    if (!post && !location.state) {
      navigate('/school-life/news', { replace: true });
    } else if (post) {
      setIsLoading(false);
    }
  }, [post, location.state, navigate]);

  // Share functionality
  const sharePost = (platform) => {
    const url = window.location.href;
    const title = encodeURIComponent(post.title);
    
    const shareUrls = {
      Facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      Twitter: `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
      LinkedIn: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`,
      WhatsApp: `https://wa.me/?text=${title} ${url}`
    };
    
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{post.title} | Kitale Progressive School</title>
        <meta name="description" content={post.excerpt || (post.content?.substring(0, 160) || 'Read the latest news and updates from Kitale Progressive School')} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt || (post.content?.substring(0, 160) || '')} />
        {post.featuredImage && <meta property="og:image" content={post.featuredImage} />}
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        {post.featuredImage && <meta name="twitter:image" content={post.featuredImage} />}
      </Helmet>

      <article className="blog-post-page py-5">
        <Container>
          {/* Breadcrumb Navigation */}
          <nav aria-label="breadcrumb" style={{ marginBottom: '1rem' }}>
            <ol style={{ display: 'flex', gap: '0.5rem', listStyle: 'none', padding: 0, flexWrap: 'wrap' }}>
              <li><a href="/" style={{ color: '#132f66', textDecoration: 'none' }}>Home</a></li>
              <li><span style={{ color: '#cebd04' }}>/</span></li>
              <li><a href="/school-life/news" style={{ color: '#132f66', textDecoration: 'none' }}>News</a></li>
              <li><span style={{ color: '#cebd04' }}>/</span></li>
              <li style={{ color: '#6b7280' }}>{post.title.substring(0, 50)}...</li>
            </ol>
          </nav>

          <Button
            variant="link"
            onClick={() => navigate(-1)}
            style={{
              color: '#132f66',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0 0 2rem 0'
            }}
          >
            <ArrowLeft size={20} />
            Back to News
          </Button>

          <Row className="justify-content-center">
            <Col lg={10}>
              {post.featuredImage && (
                <div style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '400px',
                  minHeight: '200px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  marginBottom: '2rem',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  aspectRatio: '16/9',
                  backgroundColor: '#f3f4f6'
                }}>
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.src = getLocalPlaceholder(post.title, 1200, 400);
                    }}
                  />
                </div>
              )}

              <div style={{
                display: 'flex',
                gap: '1.5rem',
                marginBottom: '1.5rem',
                color: '#6b7280',
                fontSize: '0.95rem',
                flexWrap: 'wrap'
              }}>
                {post.date && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={18} color="#cebd04" />
                    {formatDate(post.date)}
                  </span>
                )}
                {post.content && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={18} color="#cebd04" />
                    {getReadingTime(post.content)}
                  </span>
                )}
                {post.author && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={18} color="#cebd04" />
                    By {post.author}
                  </span>
                )}
                {post.category && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Tag size={18} color="#cebd04" />
                    {post.category}
                  </span>
                )}
              </div>

              <h1 style={{
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: '700',
                color: '#132f66',
                marginBottom: '2rem',
                lineHeight: 1.2
              }}>
                {post.title}
              </h1>

              <div style={{
                fontSize: '1.1rem',
                lineHeight: 1.8,
                color: '#4a5568'
              }}>
                {post.content ? (
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                ) : (
                  <p>{post.excerpt}</p>
                )}
              </div>

              <div style={{
                marginTop: '3rem',
                paddingTop: '2rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <h5 style={{ color: '#132f66', marginBottom: '1rem' }}>Share this post</h5>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {['Facebook', 'Twitter', 'LinkedIn', 'WhatsApp'].map(platform => (
                    <button
                      key={platform}
                      onClick={() => sharePost(platform)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#f3f4f6',
                        border: 'none',
                        borderRadius: '30px',
                        color: '#132f66',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#cebd04';
                        e.target.style.color = '#132f66';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#f3f4f6';
                        e.target.style.color = '#132f66';
                      }}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </article>
    </>
  );
};

export default BlogPostPage;