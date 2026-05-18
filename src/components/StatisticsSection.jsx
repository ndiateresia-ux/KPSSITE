import React, { memo } from 'react';
import { Container, Row, Col } from "react-bootstrap";
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

const StatisticsSection = memo(function StatisticsSection({ statistics }) {
  const defaultStats = [
    { value: 500, label: "Students Enrolled" },
    { value: 50, label: "Qualified Teachers" },
    { value: 15, label: "Years of Excellence" },
    { value: 98, label: "Success Rate" }
  ];

  const statsToUse = statistics || defaultStats;
  const [ref, inView] = useInView({ 
    threshold: 0.1, 
    triggerOnce: true,
    rootMargin: '50px'
  });

  // Generate unique IDs for each stat for accessibility
  const getStatId = (index) => `stat-${index}`;

  return (
    <section 
      className="statistics-section text-white py-4 py-md-5"
      aria-label="School statistics"
      role="region"
    >
      <Container>
        <h2 className="visually-hidden">School Statistics</h2>
        <Row 
          className="text-center g-4" 
          ref={ref}
          as="div"
          role="list"
          aria-label="Key statistics"
        >
          {statsToUse.map((stat, index) => (
            <Col 
              xs={6} 
              md={3} 
              key={index} 
              className="mb-3 mb-md-0"
              role="listitem"
            >
              <div 
                className="stat-item"
                aria-labelledby={getStatId(index)}
              >
                <h2 
                  id={getStatId(index)}
                  className="stat-number text-gold display-4 display-md-3"
                  aria-label={`${stat.value}${!stat.value.toString().includes('+') && !stat.value.toString().includes('K') ? '+' : ''} ${stat.label}`}
                >
                  {inView ? (
                    <CountUp 
                      end={typeof stat.value === 'number' ? stat.value : parseInt(stat.value) || 0} 
                      duration={2}
                      separator=","
                      useEasing={true}
                      delay={0.2}
                    />
                  ) : (
                    <span aria-hidden="true">0</span>
                  )}
                  {!stat.value.toString().includes('+') && !stat.value.toString().includes('K') ? (
                    <span aria-hidden="true">+</span>
                  ) : null}
                </h2>
                <p 
                  className="stat-label small small-md"
                  aria-hidden="true"
                >
                  {stat.label}
                </p>
                {/* Visually hidden text for screen readers */}
                <span className="visually-hidden">
                  {inView ? (
                    `${stat.value}${!stat.value.toString().includes('+') && !stat.value.toString().includes('K') ? '+' : ''} ${stat.label}`
                  ) : (
                    `Statistic: ${stat.label}`
                  )}
                </span>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
});

export default StatisticsSection;