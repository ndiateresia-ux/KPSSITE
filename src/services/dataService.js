// services/dataService.js
// Centralized data management service

const STORAGE_KEYS = {
  BLOGS: 'admin_blogs',
  EVENTS: 'admin_events',
  GALLERY: 'admin_gallery',
  TESTIMONIALS: 'admin_testimonials',
  FAQ: 'admin_faq',
  PARTNERS: 'admin_partners',
  PAGE_CONTENT: 'admin_page_content',
  SETTINGS: 'admin_settings',
  UPLOADED_IMAGES: 'admin_uploaded_images'
};

// Helper to get stored images
const getStoredImages = () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.UPLOADED_IMAGES) || '{}');
};

// Helper to get image URL (handles both stored base64 and static paths)
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  const storedImages = getStoredImages();
  
  // Check if it's a stored base64 image
  if (storedImages[imagePath]) {
    return storedImages[imagePath];
  }
  
  // Return the static path
  return imagePath;
};

// Blogs Service
export const getBlogs = () => {
  const saved = localStorage.getItem(STORAGE_KEYS.BLOGS);
  return saved ? JSON.parse(saved) : [];
};

export const saveBlogs = (blogs) => {
  localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(blogs));
};

// Events Service
export const getEvents = () => {
  const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
  return saved ? JSON.parse(saved) : [];
};

export const saveEvents = (events) => {
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
};

// Gallery Service
export const getGalleryImages = () => {
  const saved = localStorage.getItem(STORAGE_KEYS.GALLERY);
  return saved ? JSON.parse(saved) : [];
};

export const saveGalleryImages = (images) => {
  localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(images));
};

// Testimonials Service
export const getTestimonials = () => {
  const saved = localStorage.getItem(STORAGE_KEYS.TESTIMONIALS);
  return saved ? JSON.parse(saved) : [];
};

export const saveTestimonials = (testimonials) => {
  localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(testimonials));
};

// FAQ Service
export const getFaq = () => {
  const saved = localStorage.getItem(STORAGE_KEYS.FAQ);
  return saved ? JSON.parse(saved) : [];
};

export const saveFaq = (faq) => {
  localStorage.setItem(STORAGE_KEYS.FAQ, JSON.stringify(faq));
};

// Partners Service
export const getPartners = () => {
  const saved = localStorage.getItem(STORAGE_KEYS.PARTNERS);
  return saved ? JSON.parse(saved) : [];
};

export const savePartners = (partners) => {
  localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(partners));
};

// Page Content Service
export const getPageContent = () => {
  const saved = localStorage.getItem(STORAGE_KEYS.PAGE_CONTENT);
  if (saved) return JSON.parse(saved);
  
  // Default page content
  return {
    home_hero: { 
      title: "Give Your Child the Foundation to Lead", 
      subtitle: "Excellence in CBE education, grounded in Christian values and the warmth of the Kenyan spirit. A safe haven where curiosity thrives." 
    },
    about: { 
      title: "About Kitale Progressive School", 
      content: "At Kitale Progressive School, we believe every child carries unique potential. Our learning environment is designed to nurture curiosity, strengthen character, and build a strong academic foundation that prepares learners for the future. As a trusted private school in Kitale, on the north-rift of Kenya, we serve families seeking quality CBE education from Early Childhood Development to Junior Secondary, providing a safe and nurturing environment where every learner is supported to succeed." 
    },
    why_choose_us: { 
      title: "Why Parents Choose Us", 
      intro: "Parents choose Kitale Progressive School because we combine strong academic excellence with a nurturing and supportive environment where every child is guided to discover their potential and grow in confidence.",
      items: []
    },
    contact_info: { 
      email: "kitaleprogressivesocial@gmail.com", 
      phone: "+254 736 756 595", 
      address: "Kitale - Kapenguria RD", 
      hours: "Monday-Friday: 8:00 AM - 5:00 PM" 
    }
  };
};

export const savePageContent = (content) => {
  localStorage.setItem(STORAGE_KEYS.PAGE_CONTENT, JSON.stringify(content));
};

// Settings Service
export const getSettings = () => {
  const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (saved) return JSON.parse(saved);
  
  return {
    schoolName: "Kitale Progressive School",
    schoolEmail: "kitaleprogressivesocial@gmail.com",
    schoolPhone: "+254 736 756 595",
    schoolAddress: "Kitale - Kapenguria RD",
    facebookUrl: "https://www.facebook.com/kitaleprogressive/",
    instagramUrl: "https://www.instagram.com/kitaleprogrsv1338/",
    youtubeUrl: "https://www.youtube.com/@KPSConnect",
    tiktokUrl: "https://www.tiktok.com/@kitale.progressive",
    whatsappUrl: "https://wa.me/254780841116"
  };
};

// Initialize default data if not present
export const initializeData = () => {
  // Initialize blogs if empty
  if (!localStorage.getItem(STORAGE_KEYS.BLOGS)) {
    const defaultBlogs = [
      { id: 1, title: "Annual Sports Day 2024: A Celebration of Talent", excerpt: "Students showcased exceptional athletic abilities during our annual sports day event. From track events to team sports, it was a day filled with excitement and sportsmanship.", content: "<p>Students showcased exceptional athletic abilities during our annual sports day event. From track events to team sports, it was a day filled with excitement and sportsmanship. Parents and teachers cheered as young athletes competed in various categories, demonstrating teamwork, determination, and school spirit.</p><p>The event was graced by the County Director of Education who commended the school for nurturing talent. Over 30 schools participated in various competitions. Our school emerged winners in football, athletics, and netball categories.</p>", featuredImage: "/images/optimized/gallery/sports1.webp", date: "2024-03-15", author: "Mr. Omondi", category: "School Event" },
      { id: 2, title: "Excellence in CBC: Our Grade 6 Learners Shine", excerpt: "Our Grade 6 learners demonstrated outstanding performance in the recent CBC assessments, showcasing the effectiveness of our competency-based curriculum approach.", content: "<p>Our Grade 6 learners demonstrated outstanding performance in the recent CBC assessments, showcasing the effectiveness of our competency-based curriculum approach. Teachers attribute this success to our focus on individualized learning and continuous assessment.</p><p>The Kenya National Examinations Council praised our school for exemplary performance in the CBC assessments. Our Grade 6 learners scored above the national average in all subjects.</p>", featuredImage: "/images/optimized/gallery/academics1.webp", date: "2024-03-10", author: "Madam Sarah", category: "Academic Achievement" },
      { id: 3, title: "Building Future Leaders: Student Council Elections", excerpt: "Democracy in action as our students participated in the annual student council elections, learning valuable lessons in leadership and civic responsibility.", content: "<p>Democracy in action as our students participated in the annual student council elections, learning valuable lessons in leadership and civic responsibility. Candidates presented their manifestos, debated important issues, and campaigned respectfully.</p><p>The election process was overseen by the Social Studies department, ensuring fairness and transparency. Voter turnout was an impressive 85%.</p>", featuredImage: "/images/optimized/gallery/events4.webp", date: "2024-03-05", author: "Mr. Kipchoge", category: "Student Leadership" }
    ];
    localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(defaultBlogs));
  }
  
  // Initialize events if empty
  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    const currentYear = new Date().getFullYear();
    const defaultEvents = [
      { id: 1, title: "Term 1 Opening Day", date: `${currentYear}-01-08`, description: "School opens for Term 1. All students to report by 8:00 AM.", time: "8:00 AM", location: "School Assembly Ground", category: "academic", color: "#0d65fb" },
      { id: 2, title: "Sports Day", date: `${currentYear}-02-15`, description: "Annual inter-house sports competitions. Parents cordially invited.", time: "9:00 AM - 4:00 PM", location: "School Sports Ground", category: "sports", color: "#48bb78" },
      { id: 3, title: "Parents-Teachers Conference", date: `${currentYear}-03-10`, description: "Meet your child's teachers and discuss academic progress.", time: "2:00 PM - 6:00 PM", location: "Various Classrooms", category: "meeting", color: "#ed8936" }
    ];
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(defaultEvents));
  }
  
  // Initialize testimonials if empty
  if (!localStorage.getItem(STORAGE_KEYS.TESTIMONIALS)) {
    const defaultTestimonials = [
      { id: 1, name: "Jane Akinyi", title: "Mrs.", parentType: "ECD Parent", section: "Early Childhood Development", quote: "Our child joined in ECD, and we have seen tremendous growth in confidence, communication, and learning. The teachers are caring, patient, and truly understand how young children develop.", rating: 5 },
      { id: 2, name: "John Omondi", title: "Mr.", parentType: "Primary Parent", section: "Primary School", quote: "Kitale Progressive School has given our child a strong academic foundation. The teachers are committed, and the learning environment is very supportive.", rating: 5 },
      { id: 3, name: "Sarah Kipchoge", title: "Mrs.", parentType: "Junior Secondary Parent", section: "Junior Secondary", quote: "We wanted a school that prepares our child for the future, and we found it here. The CBE approach is well implemented.", rating: 5 }
    ];
    localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(defaultTestimonials));
  }
  
  // Initialize FAQ if empty
  if (!localStorage.getItem(STORAGE_KEYS.FAQ)) {
    const defaultFaq = [
      { category: "Admissions", questions: [{ id: 1, question: "How can I apply for admission at Kitale Progressive School?", answer: "You can apply through our online admissions form at /admissions/apply or visit the school in person. Our admissions team will guide you through the process." }] },
      { category: "Academics & Co-curricular", questions: [{ id: 2, question: "Which curriculum does Kitale Progressive School follow?", answer: "We follow the Competency-Based Education (CBE) approved by KICD, which focuses on developing practical skills, creativity, and critical thinking." }] },
      { category: "Fees & Payments", questions: [{ id: 3, question: "How can parents pay school fees?", answer: "Parents can choose between full payment before the term begins or a structured installment plan. We also offer a 5% sibling discount for families with more than one child." }] }
    ];
    localStorage.setItem(STORAGE_KEYS.FAQ, JSON.stringify(defaultFaq));
  }
};

// Call initialization
initializeData();