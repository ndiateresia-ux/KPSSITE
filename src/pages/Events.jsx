// pages/Events.jsx - Updated with Hero Background Image
import { Helmet } from "react-helmet-async";
import { Container, Row, Col, Spinner, Alert, Badge } from "react-bootstrap";
import { useState, useEffect, useMemo, useCallback, lazy, Suspense, memo } from "react";

// Lazy load non-critical components
const GetInTouch = lazy(() => import("../components/GetInTouch"));

// Memoized event card component with accessibility and featured badge support
const EventCard = memo(({ event, categories, isHovered, onHover, onLeave, index, isFeatured }) => {
  const eventDate = new Date(event.date);
  const day = eventDate.getDate().toString().padStart(2, '0');
  const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
  const eventId = `event-${event.id || index}`;
  
  return (
    <div 
      id={eventId}
      className={`card-custom event-item ${isHovered ? 'hovered' : ''} ${isFeatured ? 'featured' : ''}`}
      onMouseEnter={() => onHover(event.id)}
      onMouseLeave={onLeave}
      onFocus={() => onHover(event.id)}
      onBlur={onLeave}
      style={{ borderLeftColor: event.color, position: 'relative' }}
      role="article"
      aria-labelledby={`${eventId}-title`}
      tabIndex={0}
    >
      {isFeatured && (
        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px', zIndex: 2 }}>
          <Badge 
            bg="warning" 
            text="dark"
            className="featured-badge"
            style={{ 
              fontSize: '0.7rem', 
              fontWeight: '600', 
              padding: '4px 10px',
              borderRadius: '20px',
              backgroundColor: '#ff0080',
              color: 'white'
            }}
          >
            ⭐ Featured Event
          </Badge>
        </div>
      )}
      <div className="event-date" style={{ 
        background: `linear-gradient(135deg, ${event.color} 0%, ${event.color}dd 100%)`,
        minWidth: '60px',
        height: '60px',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }} aria-hidden="true">
        <span className="day fw-bold" style={{ fontSize: '1.5rem', lineHeight: 1 }}>{day}</span>
        <span className="month small" style={{ fontSize: '0.8rem', opacity: 0.9 }}>{month}</span>
      </div>
      <div className="event-info" style={{ flex: 1, minWidth: 0 }}>
        <h3 id={`${eventId}-title`} className="card-title-navy h6 fw-bold mb-1">{event.title}</h3>
        <div className="event-meta small d-flex flex-wrap gap-2 mb-1">
          <span className="text-muted">
            <i className="far fa-clock me-1" aria-hidden="true"></i> 
            <span className="visually-hidden">Time:</span> {event.time}
          </span>
          <span className="event-category-badge small px-2 py-1" style={{ 
            backgroundColor: `${event.color}20`, 
            color: event.color,
            borderRadius: '20px'
          }}>
            <span aria-hidden="true">{categories.find(c => c.id === event.category)?.icon}</span> 
            <span className="visually-hidden">Category:</span> {event.category}
          </span>
          {event.location && event.location !== "TBD" && (
            <span className="text-muted">
              <i className="fas fa-map-marker-alt me-1" aria-hidden="true"></i>
              <span className="visually-hidden">Location:</span> {event.location}
            </span>
          )}
        </div>
        {event.description !== "No description available" && (
          <p className="event-description small text-muted mb-0">{event.description}</p>
        )}
      </div>
    </div>
  );
});

EventCard.displayName = 'EventCard';

// Memoized calendar day component with accessibility
const CalendarDay = memo(({ day, onClick, categories, selectedCategory, index, months, selectedMonth, selectedYear }) => (
  <div 
    className={`cal-day ${day.dayNumber ? 'active' : ''} ${day.hasEvent ? 'has-event' : ''} ${day.isToday ? 'today' : ''} ${day.isSelected ? 'selected' : ''}`}
    onClick={() => day.dayNumber && onClick(day.dayNumber)}
    onKeyDown={(e) => {
      if (day.dayNumber && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick(day.dayNumber);
      }
    }}
    role={day.dayNumber ? "button" : "presentation"}
    tabIndex={day.dayNumber ? 0 : -1}
    aria-label={day.dayNumber ? 
      `${day.dayNumber} ${months[selectedMonth]} ${selectedYear}${day.hasEvent ? `, ${day.events.length} events` : ''}${day.isToday ? ', today' : ''}${day.isSelected ? ', selected' : ''}` 
      : undefined}
    style={{
      aspectRatio: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      cursor: day.dayNumber ? 'pointer' : 'default',
      borderRadius: '50%',
      fontSize: '0.9rem',
      fontWeight: day.isToday ? 'bold' : 'normal',
      backgroundColor: day.isSelected ? '#ff0080' : 'transparent',
      color: day.isSelected ? 'white' : 'inherit',
      minHeight: '44px',
      minWidth: '44px'
    }}
    title={day.hasEvent ? `${day.events.length} event(s)` : ""}
    aria-current={day.isToday ? "date" : undefined}
  >
    {day.dayNumber}
    {day.hasEvent && !day.isSelected && (
      <span style={{
        position: 'absolute',
        bottom: '2px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '4px',
        height: '4px',
        borderRadius: '50%',
        backgroundColor: categories.find(c => c.id === selectedCategory)?.color || '#0d65fb'
      }} aria-hidden="true"></span>
    )}
  </div>
));

CalendarDay.displayName = 'CalendarDay';

// Memoized category button with accessibility
const CategoryButton = memo(({ category, isActive, onClick }) => (
  <button
    className={`category-filter-btn ${isActive ? 'active' : ''}`}
    onClick={() => onClick(category.id)}
    aria-pressed={isActive}
    aria-label={`${category.name} events${isActive ? ', currently selected' : ''}`}
    style={{
      padding: '0.5rem 1rem',
      borderRadius: '40px',
      border: isActive ? 'none' : '2px solid #e2e8f0',
      backgroundColor: isActive ? category.color : 'transparent',
      color: isActive ? 'white' : '#4a5568',
      fontSize: '0.9rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      minHeight: '44px',
      minWidth: '44px'
    }}
  >
    <span aria-hidden="true">{category.icon}</span>
    <span>{category.name}</span>
  </button>
));

CategoryButton.displayName = 'CategoryButton';

function Events() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [apiError, setApiError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [featuredEventIds] = useState([1, 2]);

  // Get environment variables
  const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY;
  const GOOGLE_CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID;

  // Months
  const months = useMemo(() => [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ], []);

  const monthAbbr = useMemo(() => [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ], []);

  // Years
  const currentYear = new Date().getFullYear();
  const years = useMemo(() => [
    currentYear - 1, 
    currentYear, 
    currentYear + 1
  ], [currentYear]);

  // Categories
  const categories = useMemo(() => [
    { id: "all", name: "All", icon: "📅", color: "#718096" },
    { id: "academic", name: "Academic", icon: "📚", color: "#0d65fb" },
    { id: "sports", name: "Sports", icon: "⚽", color: "#48bb78" },
    { id: "cultural", name: "Cultural", icon: "🎭", color: "#9f7aea" },
    { id: "meeting", name: "Meetings", icon: "🤝", color: "#ed8936" },
    { id: "ceremony", name: "Ceremonies", icon: "🏆", color: "#ff0080" }
  ], []);

  // Determine category based on event title/description
  const determineCategory = useCallback((title, description) => {
    const text = (title + " " + (description || "")).toLowerCase();
    if (text.includes("sport") || text.includes("football") || text.includes("game") || text.includes("athletics")) return "sports";
    if (text.includes("music") || text.includes("dance") || text.includes("cultural") || text.includes("festival")) return "cultural";
    if (text.includes("meeting") || text.includes("conference") || text.includes("parents") || text.includes("pta")) return "meeting";
    if (text.includes("prize") || text.includes("award") || text.includes("ceremony") || text.includes("graduation")) return "ceremony";
    return "academic";
  }, []);

  // Fallback events data
  const fallbackEvents = useMemo(() => [
    {
      id: 1,
      title: "Term 1 Opening Day",
      date: `${selectedYear}-01-08`,
      description: "School opens for Term 1. All students to report by 8:00 AM.",
      category: "academic",
      time: "8:00 AM",
      location: "School Assembly Ground",
      color: "#0d65fb"
    },
    {
      id: 2,
      title: "Sports Day",
      date: `${selectedYear}-02-15`,
      description: "Annual inter-house sports competitions. Parents cordially invited.",
      category: "sports",
      time: "9:00 AM - 4:00 PM",
      location: "School Sports Ground",
      color: "#48bb78"
    },
    {
      id: 3,
      title: "Parents-Teachers Conference",
      date: `${selectedYear}-03-10`,
      description: "Meet your child's teachers and discuss academic progress.",
      category: "meeting",
      time: "2:00 PM - 6:00 PM",
      location: "Various Classrooms",
      color: "#ed8936"
    },
    {
      id: 4,
      title: "Music Festival",
      date: `${selectedYear}-03-20`,
      description: "Annual music festival featuring choir, band, and solo performances.",
      category: "cultural",
      time: "10:00 AM - 3:00 PM",
      location: "School Hall",
      color: "#9f7aea"
    },
    {
      id: 5,
      title: "Term 1 Closed",
      date: `${selectedYear}-03-28`,
      description: "School closes for Term 1 holidays. Dismissal at 12:00 PM.",
      category: "academic",
      time: "12:00 PM",
      location: "School",
      color: "#0d65fb"
    },
    {
      id: 6,
      title: "Science Fair",
      date: `${selectedYear}-05-10`,
      description: "Students showcase their science projects and experiments.",
      category: "academic",
      time: "9:00 AM - 2:00 PM",
      location: "Science Lab Complex",
      color: "#0d65fb"
    },
    {
      id: 7,
      title: "Cultural Day",
      date: `${selectedYear}-06-05`,
      description: "Celebration of Kenya's diverse cultures with performances.",
      category: "cultural",
      time: "10:00 AM - 4:00 PM",
      location: "School Grounds",
      color: "#9f7aea"
    },
    {
      id: 8,
      title: "Prize Giving Day",
      date: `${selectedYear}-07-20`,
      description: "Annual awards ceremony recognizing student achievements.",
      category: "ceremony",
      time: "9:00 AM - 1:00 PM",
      location: "School Hall",
      color: "#ff0080"
    }
  ], [selectedYear]);

  // Fetch calendar events from Google Calendar
  const fetchGoogleCalendarEvents = useCallback(async () => {
    setLoading(true);
    setApiError(false);
    
    try {
      if (!GOOGLE_API_KEY || !GOOGLE_CALENDAR_ID) {
        console.warn("Google Calendar API credentials missing, using fallback events");
        setEvents(fallbackEvents);
        setApiError(true);
        setLoading(false);
        return;
      }

      const timeMin = new Date(selectedYear, 0, 1).toISOString();
      const timeMax = new Date(selectedYear, 11, 31, 23, 59, 59).toISOString();
      
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GOOGLE_CALENDAR_ID)}/events?` +
                  `key=${GOOGLE_API_KEY}&timeMin=${timeMin}&timeMax=${timeMax}&` +
                  `singleEvents=true&orderBy=startTime&maxResults=50`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, { 
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Calendar API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const formattedEvents = data.items.slice(0, 50).map((event, index) => {
          const isAllDay = !!event.start?.date;
          const eventDate = isAllDay ? event.start.date : event.start?.dateTime?.split('T')[0];
          
          let eventTime = "All day";
          if (!isAllDay && event.start?.dateTime) {
            eventTime = new Date(event.start.dateTime).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            });
          }
          
          const category = determineCategory(event.summary, event.description);
          const categoryColor = categories.find(c => c.id === category)?.color || "#0d65fb";
          
          return {
            id: event.id || index,
            title: event.summary || "Untitled Event",
            date: eventDate,
            description: event.description || "No description available",
            time: eventTime,
            category,
            color: categoryColor,
            location: event.location || "TBD"
          };
        });
        
        setEvents(formattedEvents);
      } else {
        setEvents(fallbackEvents);
      }
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      setApiError(true);
      setEvents(fallbackEvents);
    } finally {
      setLoading(false);
    }
  }, [GOOGLE_API_KEY, GOOGLE_CALENDAR_ID, selectedYear, categories, fallbackEvents, determineCategory]);

  useEffect(() => {
    fetchGoogleCalendarEvents();
  }, [selectedYear, fetchGoogleCalendarEvents]);

  const filteredEvents = useMemo(() => {
    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getMonth() === selectedMonth && 
               eventDate.getFullYear() === selectedYear &&
               (selectedCategory === "all" || event.category === selectedCategory);
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events, selectedMonth, selectedYear, selectedCategory]);

  const eventDays = useMemo(() => {
    return new Set(filteredEvents.map(event => new Date(event.date).getDate()));
  }, [filteredEvents]);

  const monthEventCount = filteredEvents.length;

  const handleDateClick = useCallback((dayNumber) => {
    setSelectedDate(dayNumber);
    const eventElement = document.getElementById(`event-${dayNumber}`);
    if (eventElement) {
      eventElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      eventElement.setAttribute('tabindex', '-1');
      eventElement.focus({ preventScroll: true });
    }
  }, []);

  const getEventsForDate = useCallback((day) => {
    return filteredEvents.filter(event => new Date(event.date).getDate() === day);
  }, [filteredEvents]);

  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedDate(null);
  }, []);

  const handleHover = useCallback((id) => setHoveredEvent(id), []);
  const handleLeave = useCallback(() => setHoveredEvent(null), []);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const totalCells = Math.ceil((adjustedFirstDay + daysInMonth) / 7) * 7;
    
    return Array.from({ length: totalCells }, (_, i) => {
      const dayNumber = i - adjustedFirstDay + 1;
      const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;
      const hasEvent = isValidDay && eventDays.has(dayNumber);
      const isToday = isValidDay && 
        dayNumber === new Date().getDate() && 
        selectedMonth === new Date().getMonth() && 
        selectedYear === new Date().getFullYear();
      const isSelected = isValidDay && selectedDate === dayNumber;

      return {
        dayNumber: isValidDay ? dayNumber : null,
        hasEvent,
        isToday,
        isSelected,
        events: isValidDay ? getEventsForDate(dayNumber) : []
      };
    });
  }, [selectedYear, selectedMonth, eventDays, selectedDate, getEventsForDate]);

  return (
    <>
      <Helmet>
        <title>Events Calendar | Kitale Progressive School</title>
        <meta 
          name="description" 
          content="Stay informed about key school events, academic calendar, and activities at Kitale Progressive School." 
        />
      </Helmet>

      {/* Hero Section - Matching Curriculum Page with Background Image */}
      <section className="events-hero-section" aria-labelledby="page-title">
        <div className="events-hero-content">
          <h1 id="page-title">Events &  Dates</h1>
          <p>Stay informed about key school events, academic activities and moments that shape your child's learning journey.</p>
        </div>
      </section>

      {/* Events Intro Section - Reduced spacing */}
      <section className="py-5">
        <Container>
          <div className="quote-block p-3 text-center" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(5px)', borderRadius: '16px', borderLeft: '5px solid var(--secondary)', boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }}>
            <p className="lead mb-0"  style={{ fontSize: '1.1rem', color: 'var(--text-dark)', fontStyle: 'italic', fontWeight: '500', lineHeight: 1.5 }}>
              Stay updated on academic calenders, events and key school activities throughout the term            </p>
          </div>
        </Container>
      </section>

      {/* Main Events Section - Reduced padding */}
      <section className="py-4" aria-labelledby="events-heading">
        <Container>
          <h1 id="events-heading" className="section-heading mb-3 text-center">School Calendar & Events</h1>

          {/* API Error Alert */}
          {apiError && (
            <Row className="mb-3">
              <Col lg={8} className="mx-auto">
                <Alert variant="warning" className="text-center small py-2" role="alert">
                  <i className="fas fa-exclamation-triangle me-2" aria-hidden="true"></i>
                  Using sample events. Unable to connect to live calendar.
                </Alert>
              </Col>
            </Row>
          )}
         
          {/* Filter description - Reduced margin */}
          <p className="lead text-center mb-4 px-3 px-md-5" style={{ 
            maxWidth: "900px", 
            margin: "0 auto 2rem", 
            color: 'var(--text-dark)',
            fontSize: '1rem'
          }}>
            Filter events by category to quickly find academic, sports, and school activities relevant to your child.
          </p> 
          
          {/* Category Selector */}
          <div className="d-flex flex-wrap justify-content-center gap-2 mb-4" role="group" aria-label="Event categories">
            {categories.map(category => (
              <CategoryButton
                key={category.id}
                category={category}
                isActive={selectedCategory === category.id}
                onClick={handleCategoryChange}
              />
            ))}
          </div>

          {/* Main Grid */}
          <Row className="g-4">
            {/* Left Column - Events List */}
            <Col lg={8}>
              <div className="upcoming-header d-flex justify-content-between align-items-center mb-3">
                <h2 className="card-title-navy h5 fw-bold mb-0">
                  {selectedCategory === 'all' ? 'All Events' : `${categories.find(c => c.id === selectedCategory)?.name} Events`}
                  <span className="ms-2 small text-muted">({monthAbbr[selectedMonth]} {selectedYear})</span>
                </h2>
              </div>

              {loading ? (
                <div className="text-center py-4" role="status" aria-live="polite">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2 text-muted">Loading events...</p>
                  <span className="visually-hidden">Loading events, please wait</span>
                </div>
              ) : (
                <>
                  {filteredEvents.length > 0 ? (
                    <div className="d-flex flex-column gap-3" role="list" aria-label="Events list">
                      {filteredEvents.map((event, index) => (
                        <EventCard
                          key={event.id || index}
                          event={event}
                          categories={categories}
                          isHovered={hoveredEvent === event.id}
                          onHover={handleHover}
                          onLeave={handleLeave}
                          index={index}
                          isFeatured={featuredEventIds.includes(event.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-light-custom rounded-3" role="status">
                      <i className="fas fa-calendar-times fs-1 text-muted mb-2" aria-hidden="true"></i>
                      <h3 className="h6 fw-bold text-navy">No events found</h3>
                      <p className="small text-muted mb-0">Try a different month or category</p>
                    </div>
                  )}
                </>
              )}
            </Col>

            {/* Right Column - Calendar */}
            <Col lg={4}>
              <div className="calendar-card bg-white p-3 rounded-4 shadow-sm" style={{ position: 'sticky', top: '100px' }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h2 className="card-title-navy h6 fw-bold mb-0">
                    {months[selectedMonth]} {selectedYear}
                  </h2>
                  <span className="small text-muted" aria-live="polite" aria-atomic="true">
                    <i className="far fa-calendar-check me-1" aria-hidden="true"></i>
                    {monthEventCount} {monthEventCount === 1 ? 'event' : 'events'}
                  </span>
                </div>

                {/* Month/Year Controls */}
                <div className="d-flex gap-2 mb-3">
                  <select 
                    className="form-control-custom form-select-sm"
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(parseInt(e.target.value));
                      setSelectedDate(null);
                    }}
                    style={{ borderRadius: '20px' }}
                    aria-label="Select month"
                  >
                    {months.map((month, index) => (
                      <option key={month} value={index}>{month}</option>
                    ))}
                  </select>
                  <select 
                    className="form-control-custom form-select-sm"
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(parseInt(e.target.value));
                      setSelectedDate(null);
                    }}
                    style={{ borderRadius: '20px' }}
                    aria-label="Select year"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Calendar Grid */}
                <div 
                  className="calendar-grid" 
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '2px',
                    marginBottom: '1rem'
                  }}
                  role="grid"
                  aria-label="Calendar"
                >
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                    <div key={day} className="text-center small fw-bold text-muted py-1" role="columnheader">
                      {day.slice(0, 1)}
                      <span className="visually-hidden">{day}</span>
                    </div>
                  ))}
                  {calendarDays.map((day, index) => (
                    <CalendarDay
                      key={index}
                      day={day}
                      onClick={handleDateClick}
                      categories={categories}
                      selectedCategory={selectedCategory}
                      index={index}
                      months={monthAbbr}
                      selectedMonth={selectedMonth}
                      selectedYear={selectedYear}
                    />
                  ))}
                </div>

                {/* Legend */}
                <div className="d-flex flex-wrap gap-2 small">
                  <div className="d-flex align-items-center gap-1">
                    <span className="cal-day has-event" style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#ebf8ff' }} aria-hidden="true"></span>
                    <span className="text-muted">Has events</span>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <span className="cal-day today" style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid var(--navy)' }} aria-hidden="true"></span>
                    <span className="text-muted">Today</span>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <span className="cal-day selected" style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: 'var(--gold)' }} aria-hidden="true"></span>
                    <span className="text-muted">Selected</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-3 pt-2 border-top" aria-live="polite" aria-atomic="true">
                  <div className="d-flex justify-content-between align-items-center small">
                    <span className="text-muted">Total events:</span>
                    <span className="fw-bold text-navy" aria-label={`Total events: ${monthEventCount}`}>{monthEventCount}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center small mt-1">
                    <span className="text-muted">Categories:</span>
                    <span className="fw-bold text-navy" aria-label={`Categories: ${new Set(filteredEvents.map(e => e.category)).size}`}>{new Set(filteredEvents.map(e => e.category)).size}</span>
                  </div>
                  {selectedDate && (
                    <div className="d-flex justify-content-between align-items-center small mt-1">
                      <span className="text-muted">Events on {selectedDate}:</span>
                      <span className="fw-bold text-navy" aria-label={`Events on ${selectedDate}: ${getEventsForDate(selectedDate).length}`}>{getEventsForDate(selectedDate).length}</span>
                    </div>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Why This Matters Section - Reduced padding */}
      <section className="statistics-section py-4" aria-labelledby="why-matters-heading">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h2 id="why-matters-heading" className="h2 fw-bold mb-2 text-white">
                Why This Matters for You as a Parent
              </h2>
              <p className="lead text-white" style={{ fontSize: '1.1rem', maxWidth: '800px', margin: '5' }}>
                Keeping track of school events helps you stay involved in your child's education, support their activities, and plan effectively throughout the school term.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      <Suspense fallback={null}>
        <GetInTouch />
      </Suspense>

      {/* Additional CSS for event items and hero section */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Hero Section with Background Image - Matching Curriculum Page */
        .events-hero-section {
          position: relative;
          background: linear-gradient(135deg, #0d65fb 0%, #0a55d6 100%);
          min-height: 350px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
        }

        .events-hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url('/images/optimized/tour1.webp');
          background-size: 100% 100%;;
          background-position: center;
          background-repeat: no-repeat;
          filter: blur(0px);
          opacity: 0.9;
          z-index: 0;
        }

        .events-hero-section::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(13, 101, 251, 0.6), rgba(10, 85, 214, 0.7));
          z-index: 1;
        }

        .events-hero-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
          margin: 0 auto;
          padding: 80px 20px;
          color: white;
        }

        .events-hero-content h1 {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          margin-bottom: 1rem;
          color: white;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .events-hero-content p {
          font-size: clamp(1rem, 4vw, 1.2rem);
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.6;
          text-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
        }

        .event-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border-left: 4px solid;
          position: relative;
        }
        .event-item:hover,
        .event-item:focus-within {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        .event-item.featured {
          background: linear-gradient(135deg, #ffffff 0%, #fff5f5 100%);
          border-left-width: 6px;
        }
        .cal-day {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          cursor: pointer;
          border-radius: 50%;
          transition: all 0.2s ease;
          min-height: 44px;
          min-width: 44px;
        }
        .cal-day.active:hover,
        .cal-day.active:focus-visible {
          background: #f0f4ff;
          outline: 3px solid var(--gold);
          outline-offset: 2px;
        }
        .cal-day.has-event:not(.selected) {
          background: #ebf8ff;
          font-weight: 500;
        }
        .cal-day.today {
          border: 2px solid var(--navy);
          font-weight: bold;
        }
        .cal-day.selected {
          background-color: var(--gold);
          color: white;
        }
        .category-filter-btn.active {
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        @media (max-width: 768px) {
          .events-hero-content {
            padding: 60px 20px;
          }
          .event-item {
            flex-direction: column;
            gap: 0.5rem;
          }
          .calendar-card {
            position: static !important;
          }
          .section-heading {
            font-size: 1.6rem;
          }
        }
        @media (max-width: 576px) {
          .events-hero-content {
            padding: 50px 20px;
          }
          .events-hero-content h1 {
            font-size: 1.8rem;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .event-item, .cal-day, * {
            transition: none !important;
          }
        }
      `}} />
    </>
  );
}

export default memo(Events);