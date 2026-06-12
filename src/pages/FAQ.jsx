// pages/FAQ.jsx - Fully Updated with Hero Background Image
import { Helmet } from "react-helmet-async";
import { Container, Row, Col, Accordion, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { lazy, Suspense, memo, useCallback } from "react";

// Lazy load non-critical components
const GetInTouch = lazy(() => import("../components/GetInTouch"));

function FAQ() {
  // Trust Bar Data
  const trustItems = [
    { icon: "✓", label: "CBC Curriculum" },
    { icon: "✓", label: "ECD to Junior Secondary" },
    { icon: "✓", label: "Boarding Available" },
    { icon: "✓", label: "Located in Kitale" }
  ];

  // FAQ DATA
  const faqCategories = [
    {
      category: "Admissions",
      icon: "📋",
      color: "#4299e1",
      questions: [
        {
          question: "How can I apply for admission at Kitale Progressive School in Kitale, Kenya?",
          answer: `
            You can apply through our <a href="/admissions/apply" class="text-navy fw-bold">online admissions form</a> or visit the school in person. Our admissions team will guide you through the process.
            <br/><br/>
            <a href="/admissions/apply" class="text-navy fw-bold">Begin your application here →</a>
          `
        },
        {
          question: "Is there an admission interview or assessment?",
          answer: `
            Yes. Depending on the grade level, learners may undergo a simple assessment to help us understand their current level.
            <br/><br/>
            <a href="/contact" class="text-navy fw-bold">Contact admissions</a> to schedule an assessment.
          `
        },
        {
          question: "How do I know this is the right school for my child?",
          answer: `
            The best way is to visit the school, meet our teachers, and experience the environment firsthand.
            <br/><br/>
            <a href="/contact" class="text-navy fw-bold">Book a school visit →</a>
          `
        },
        {
          question: "What are the school's hair and grooming guidelines for learners?",
          answer: `
            At Kitale Progressive School, we maintain simple and neat grooming standards.
            <br/><br/>
            <strong>For girls:</strong><br/>
            • Allowed styles include push-back styles, ponytails, half-lines, twists, and three-strand braids.<br/>
            • Hair should always be kept away from the face.
            <br/><br/>
            <strong>For boys:</strong><br/>
            • Hair should be neatly shaved or kept short and clean.
          `
        }
      ]
    },
    {
      category: "Academics & Co-curricular",
      icon: "🏆",
      color: "#48bb78",
      questions: [
        {
          question: "Which curriculum does Kitale Progressive School follow?",
          answer: `
            We follow the <strong>Competency-Based Curriculum (CBC)</strong>, which focuses on developing practical skills, creativity, and critical thinking.
            <br/><br/>
            <a href="/academics/curriculum" class="text-navy fw-bold">View full curriculum →</a>
          `
        },
        {
          question: "What is the average class size?",
          answer: `
            We maintain manageable class sizes to ensure each learner receives adequate attention and support.
            <br/><br/>
            <a href="/academics/curriculum" class="text-navy fw-bold">Learn about our teaching approach →</a>
          `
        },
        {
          question: "What sports and clubs are available?",
          answer: `
            Sports & clubs include Football, Volleyball, Netball, Handball, Taekwondo, Swimming, Chess, Music, Debate, and Computer Club.
            <br/><br/>
            <a href="/academics/clubs-societies" class="text-navy fw-bold">View clubs & societies →</a>
          `
        }
      ]
    },
    {
      category: "Boarding & Student Life",
      icon: "🏡",
      color: "#9f7aea",
      questions: [
        {
          question: "What are the boarding facilities like?",
          answer: `
            Our boarding facilities provide a safe, structured, and supportive environment.
            <br/><br/>
            <a href="/school-life/boarding" class="text-navy fw-bold">View boarding facilities →</a>
          `
        },
        {
          question: "How is security ensured for boarders?",
          answer: `
            We prioritize student safety through controlled access, supervision, and structured routines.
            <br/><br/>
          `
        },
        {
          question: "What is the daily routine for boarders?",
          answer: `
            Boarders follow a structured schedule: Wake up at 5:30 AM, morning prep, classes 8:00 AM–5:00 PM, evening prep, lights out at 9:00 PM.
            <br/><br/>
            <a href="/school-life/events" class="text-navy fw-bold">View events calendar →</a>
          `
        }
      ]
    },
    {
      category: "Fees & Payments",
      icon: "💰",
      color: "#f56565",
      questions: [
        {
          question: "How can parents pay school fees?",
          answer: `
            Parents can choose between full payment before the term begins or a structured installment plan.
            <br/><br/>
            <a href="/admissions/fee-structure" class="text-navy fw-bold">View fee structure →</a>
          `
        },
        {
          question: "Are there any additional costs besides fees?",
          answer: `
            All school fees are clearly outlined. Any additional costs are communicated in advance.
            <br/><br/>
            <a href="/admissions/fee-structure" class="text-navy fw-bold">View complete fee breakdown →</a>
          `
        },
        {
          question: "Does the school offer sibling discounts?",
          answer: `
            Yes. 5% discount for second and subsequent children from the same family.
            <br/><br/>
            <a href="/admissions/fee-structure" class="text-navy fw-bold">View fee structure →</a>
          `
        }
      ]
    },
    {
      category: "School Transport",
      icon: "🚌",
      color: "#ed8936",
      questions: [
        {
          question: "Does the school provide transport?",
          answer: `
            Yes. We provide reliable school transport services covering key areas within Kitale.
            <br/><br/>
            <a href="/contact" class="text-navy fw-bold">Contact transport office →</a>
          `
        },
        {
          question: "What are the school start and end times?",
          answer: `
            School starts at 8:00 AM and ends at 5:00 PM from Monday to Friday.
            <br/><br/>
            <a href="/school-life/events" class="text-navy fw-bold">View school calendar →</a>
          `
        }
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions | Kitale Progressive School</title>
        <meta
          name="description"
          content="Find clear answers about admissions, CBC curriculum, boarding, fees, and student life at Kitale Progressive School."
        />
      </Helmet>

      {/* HERO SECTION */}
      <section className="faq-hero-section" aria-labelledby="page-title">
        <div className="faq-hero-content">
          <h1 id="page-title">Frequently Asked Questions</h1>
          <p>Find clear answers about admissions, CBC curriculum, boarding, fees, and student life.</p>
        </div>
      </section>

      {/* TRUST BAR SECTION */}
      <section className="py-5" style={{ background: '#f8f9fa' }} aria-label="Key school features">
        <Container>
          <div className="text-center mb-4">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
              Why Choose Kitale Progressive School
            </h2>
            <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto' }}>
              Discover what makes our school the preferred choice for quality education
            </p>
          </div>
          <Row className="g-3 justify-content-center">
            {trustItems.map((item, idx) => (
              <Col key={idx} xs={6} md={3}>
                <div style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '1rem 0.75rem',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  transition: 'transform 0.3s ease',
                  height: '100%',
                  border: '1px solid rgba(13,101,251,0.08)'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: 'linear-gradient(135deg, rgba(13,101,251,0.1) 0%, rgba(255,0,128,0.05) 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.6rem'
                  }}>
                    <span style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: '#050265'
                    }} aria-hidden="true">{item.icon}</span>
                  </div>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: '#050265',
                    display: 'block'
                  }}>{item.label}</span>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* FAQ CONTENT */}
      <section style={{ padding: '50px 0', background: '#f8f9fa' }}>
        <Container>
          {faqCategories.map((cat, catIndex) => (
            <Row key={catIndex} className="mb-4">
              <Col lg={10} className="mx-auto">
                <Card className="border-0 shadow-sm overflow-hidden">
                  <Card.Body className="p-0">
                    {/* Category Header */}
                    <div 
                      style={{
                        backgroundColor: cat.color,
                        padding: '1rem 1.5rem',
                        color: 'white'
                      }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: '1.5rem' }} aria-hidden="true">{cat.icon}</span>
                        <h2 className="h5 fw-bold mb-0 text-white">
                          {cat.category}
                        </h2>
                      </div>
                    </div>

                    {/* Accordion */}
                    <div style={{ padding: '0.5rem' }}>
                      <Accordion flush defaultActiveKey={null}>
                        {cat.questions.map((item, qIndex) => {
                          const eventKey = `${catIndex}-${qIndex}`;
                          return (
                            <Accordion.Item
                              eventKey={eventKey}
                              key={qIndex}
                              style={{
                                border: 'none',
                                borderBottom: qIndex < cat.questions.length - 1 ? '1px solid #e9ecef' : 'none'
                              }}
                            >
                              <Accordion.Header>
                                <h3 style={{ fontSize: '0.95rem', marginBottom: 0 }}>
                                  {item.question}
                                </h3>
                              </Accordion.Header>
                              <Accordion.Body>
                                <div 
                                  dangerouslySetInnerHTML={{ __html: item.answer }}
                                  style={{ lineHeight: 1.6, fontSize: '0.9rem' }}
                                />
                              </Accordion.Body>
                            </Accordion.Item>
                          );
                        })}
                      </Accordion>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          ))}

          {/* CTA SECTION */}
          <Row className="mt-5">
            <Col lg={8} className="mx-auto">
              <Card className="border-0 shadow-lg" style={{
                background: 'linear-gradient(135deg, #050265, #1a6bff)',
                color: 'white'
              }}>
                <Card.Body className="p-4 p-lg-5 text-center">
                  <h3 className="h4 fw-bold mb-2">
                    Still Have Questions?
                  </h3>
                  <p className="mb-4">
                    Our admissions team is ready to guide you. Speak with us or begin your application today.
                  </p>
                  <div className="d-flex gap-3 justify-content-center flex-wrap">
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
      </section>

      <Suspense fallback={null}>
        <GetInTouch />
      </Suspense>

      {/* Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .faq-hero-section {
          position: relative;
          background: linear-gradient(135deg, #0d65fb 0%, #0a55d6 100%);
          min-height: 350px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
        }
        
        .faq-hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url('/images/optimized/gate2.webp');
         background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          filter: blur(0px);
          transform: scale(1.05);
          opacity: 1.0;
          z-index: 0;
        }
        
        .faq-hero-section::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(13,101,251,0.6), rgba(10,85,214,0.7));
          z-index: 1;
        }
        
        .faq-hero-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
          padding: 80px 20px;
          color: white;
        }
        
        .faq-hero-content h1 {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          margin-bottom: 1rem;
        }
        
        .faq-hero-content p {
          font-size: clamp(1rem, 4vw, 1.2rem);
        }
        
        .accordion-button {
          background-color: white !important;
          padding: 1rem 1.25rem !important;
          font-weight: 500 !important;
        }
        
        .accordion-button:not(.collapsed) {
          background-color: #f8f9fa !important;
          color: #050265 !important;
        }
        
        .accordion-button:focus {
          box-shadow: 0 0 0 3px #ffd700 !important;
        }
        
        .accordion-body {
          background-color: #f8f9fa !important;
        }
        
        .text-navy {
          color: #050265 !important;
          text-decoration: none;
        }
        
        .text-navy:hover {
          text-decoration: underline;
        }
        
        @media (max-width: 768px) {
          .faq-hero-content {
            padding: 60px 20px;
          }
          .accordion-button {
            padding: 0.75rem 1rem !important;
            font-size: 0.85rem;
          }
        }
      `}} />
    </>
  );
}

export default memo(FAQ);