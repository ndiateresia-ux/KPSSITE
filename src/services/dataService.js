// services/dataService.js - Complete file with all CRUD operations (No axios dependency)
// ==================== CONFIGURATION ====================
const CONFIG = {
  JSONBIN_API_KEY: import.meta.env.VITE_JSONBIN_API_KEY,
  JSONBIN_BIN_ID: import.meta.env.VITE_JSONBIN_BIN_ID,
  IMGBB_API_KEY: import.meta.env.VITE_IMGBB_API_KEY,
};

// ==================== THE updateData FUNCTION ====================
const updateData = async (data) => {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${CONFIG.JSONBIN_BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': CONFIG.JSONBIN_API_KEY,
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Data updated successfully:', result);
    return result;
  } catch (error) {
    console.error('Error updating data:', error);
    throw error;
  }
};

// ==================== GET DATA FROM JSON BIN ====================
const getJsonBinData = async () => {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${CONFIG.JSONBIN_BIN_ID}/latest`, {
      headers: {
        'X-Master-Key': CONFIG.JSONBIN_API_KEY,
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.record;
  } catch (error) {
    console.error('Error reading from JSON Bin:', error);
    return null;
  }
};

// ==================== SAVE DATA TO JSON BIN ====================
const saveJsonBinData = async (data) => {
  return await updateData(data);
};

// ==================== DATA KEYS ====================
const KEYS = {
  BLOGS: 'blogs',
  EVENTS: 'events',
  GALLERY: 'gallery',
  TESTIMONIALS: 'testimonials',
  FAQ: 'faq',
  PARTNERS: 'partners',
  FEE_STRUCTURE: 'feeStructure',
  PAGE_CONTENT: 'pageContent',
  FOOTER_SETTINGS: 'footerSettings',
  SETTINGS: 'settings',
};

// ==================== GENERIC CRUD FUNCTIONS ====================
const getCollection = async (key) => {
  const allData = await getJsonBinData();
  if (allData && allData[key]) {
    return allData[key];
  }
  return getDefaultData(key);
};

const saveCollection = async (key, data) => {
  const allData = await getJsonBinData();
  const updatedData = { ...allData, [key]: data };
  return await saveJsonBinData(updatedData);
};

// ==================== COMPLETE DEFAULT DATA ====================
const getDefaultData = (key) => {
  const defaults = {
    // ==================== BLOGS ====================
    blogs: [
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
        category: "School Event"
      },
      {
        id: 2,
        slug: "excellence-in-cbc-grade-6",
        title: "Excellence in CBC: Our Grade 6 Learners Shine",
        excerpt: "Our Grade 6 learners demonstrated outstanding performance in the recent CBC assessments with remarkable scores in all competency areas.",
        content: "<p>The Competency-Based Curriculum has transformed how our students learn and grow. Our Grade 6 learners have shown remarkable progress in all competency areas including literacy, numeracy, and life skills.</p><p>Parents and teachers have been impressed with the holistic development of the learners, who are now better prepared for higher education and life challenges.</p>",
        fullStory: "<p>Our Grade 6 learners have shown remarkable progress in all competency areas including literacy, numeracy, creativity, and critical thinking. The CBC approach has fostered independent learning and problem-solving skills.</p><p>The school has invested in modern teaching resources and teacher training to ensure effective implementation of the curriculum. Regular assessments and feedback help track learner progress and identify areas for improvement.</p>",
        featuredImage: "/images/optimized/gallery/academics3.webp",
        author: "Madam Sarah",
        date: "2024-11-15",
        category: "Academic Achievement"
      },
      {
        id: 3,
        slug: "student-council-elections-2024",
        title: "Building Future Leaders: Student Council Elections",
        excerpt: "Democracy in action as our students participated in the annual student council elections with great enthusiasm and civic awareness.",
        content: "<p>The student council elections provide valuable leadership experience for our learners. Candidates presented their manifestos and campaigned across the school, showcasing their leadership qualities.</p><p>Students exercised their democratic rights by voting for their preferred candidates, making this a practical lesson in democracy and civic responsibility.</p>",
        fullStory: "<p>Candidates presented their manifestos and campaigned across the school, sharing their vision for improving student welfare and school activities. The election process was conducted with transparency and fairness.</p><p>The newly elected student council will work closely with the school administration to implement student-led initiatives and represent student interests. This experience helps develop essential leadership and communication skills.</p>",
        featuredImage: "/images/optimized/gallery/events4.webp",
        author: "Mr. Kipchoge",
        date: "2024-10-20",
        category: "Student Leadership"
      },
      {
        id: 4,
        slug: "science-fair-2024",
        title: "Innovation Showcase: Annual Science Fair 2024",
        excerpt: "Young scientists impressed everyone with their innovative projects addressing real-world challenges through creative scientific solutions.",
        content: "<p>The annual science fair showcased the creativity and scientific thinking of our students. Projects ranged from environmental conservation to technology solutions for everyday problems.</p><p>Students demonstrated their research skills and presented their findings to judges and visitors, showing how science can solve real-world problems.</p>",
        fullStory: "<p>Projects ranged from environmental conservation to technology solutions for everyday problems. Winners received special recognition and will represent the school at the regional science competition.</p><p>The science fair has become a platform for nurturing young scientists and innovators. Students are encouraged to think critically and apply scientific principles to address community challenges.</p>",
        featuredImage: "/images/optimized/gallery/academics1.webp",
        author: "Dr. Mwangi",
        date: "2024-09-28",
        category: "STEM"
      },
      {
        id: 5,
        slug: "culture-day-celebration",
        title: "Celebrating Diversity: Cultural Day 2024",
        excerpt: "Students showcased Kenya's rich cultural heritage through music, dance, traditional cuisine, and colorful attire from various communities.",
        content: "<p>Cultural Day was a vibrant celebration of Kenya's diverse cultural heritage. Students and staff dressed in traditional attire representing various Kenyan communities.</p><p>The event featured traditional dances, music performances, storytelling, and a food fair where parents and students shared traditional dishes.</p>",
        fullStory: "<p>The event featured traditional dances, music performances, storytelling, and a food fair where parents and students shared traditional dishes. This celebration promotes cultural understanding and national unity.</p><p>Parents were invited to participate and share their cultural knowledge with students. The event was a powerful reminder of the beauty in diversity and the importance of preserving cultural heritage.</p>",
        featuredImage: "/images/optimized/gallery/cultural4.webp",
        author: "Madam Grace",
        date: "2024-09-15",
        category: "Cultural Event"
      }
    ],

    // ==================== EVENTS ====================
    events: [
      { 
        id: 1, 
        title: "Term 1 Opening Day", 
        date: `${new Date().getFullYear()}-01-08`, 
        description: "School opens for Term 1. All students are expected to report by 8:00 AM.", 
        time: "8:00 AM", 
        location: "School Assembly Ground", 
        category: "academic", 
        color: "#0d65fb" 
      },
      { 
        id: 2, 
        title: "Sports Day", 
        date: `${new Date().getFullYear()}-02-15`, 
        description: "Annual inter-house sports competitions featuring athletics, ball games, and fun activities for all students.", 
        time: "9:00 AM - 4:00 PM", 
        location: "School Sports Ground", 
        category: "sports", 
        color: "#48bb78" 
      },
      { 
        id: 3, 
        title: "Parents-Teachers Conference", 
        date: `${new Date().getFullYear()}-03-10`, 
        description: "Meet your child's teachers and discuss academic progress, challenges, and strategies for improvement.", 
        time: "2:00 PM - 6:00 PM", 
        location: "Various Classrooms", 
        category: "meeting", 
        color: "#ed8936" 
      },
      { 
        id: 4, 
        title: "Graduation Ceremony", 
        date: `${new Date().getFullYear()}-11-20`, 
        description: "Celebration of our graduating students' achievements and their transition to the next level of their academic journey.", 
        time: "10:00 AM", 
        location: "School Hall", 
        category: "ceremony", 
        color: "#ff0080" 
      },
      { 
        id: 5, 
        title: "Cultural Day", 
        date: `${new Date().getFullYear()}-09-15`, 
        description: "Celebration of Kenya's rich cultural diversity through music, dance, and traditional cuisine from various communities.", 
        time: "9:00 AM - 3:00 PM", 
        location: "School Grounds", 
        category: "cultural", 
        color: "#9f7aea" 
      }
    ],

    // ==================== GALLERY ====================
    gallery: [
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
      { id: 27, filename: "facilities8", alt: "School van", category: "facilities", imageUrl: "/images/optimized/gallery/facilities8.jpg" }
    ],

    // ==================== TESTIMONIALS ====================
    testimonials: [
      { 
        id: 1, 
        name: "Jane Akinyi", 
        title: "Mrs.", 
        parentType: "ECD Parent", 
        section: "Early Childhood Development", 
        quote: "Our child joined in ECD, and we have seen tremendous growth in confidence, communication, and learning. The teachers are caring, patient, and truly understand how young children develop.",
        rating: 5 
      },
      { 
        id: 2, 
        name: "John Omondi", 
        title: "Mr.", 
        parentType: "Primary Parent", 
        section: "Primary School", 
        quote: "Kitale Progressive School has given our child a strong academic foundation. The teachers are committed, and the learning environment is very supportive.",
        rating: 5 
      },
      { 
        id: 3, 
        name: "Sarah Kipchoge", 
        title: "Mrs.", 
        parentType: "Junior Secondary Parent", 
        section: "Junior Secondary", 
        quote: "We wanted a school that prepares our child for the future, and we found it here. The CBE approach is well implemented and our child is thriving.",
        rating: 5 
      },
      { 
        id: 4, 
        name: "David Mwangi", 
        title: "Mr.", 
        parentType: "Boarding Parent", 
        section: "Boarding Program", 
        quote: "The boarding environment is safe, structured, and well managed. As a parent, I have peace of mind knowing my child is in good hands.",
        rating: 5 
      },
      { 
        id: 5, 
        name: "Grace Otieno", 
        title: "Mrs.", 
        parentType: "ECDE Parent", 
        section: "Parent", 
        quote: "What stands out is how the school combines strong academics with character development. My child has grown in confidence and responsibility.",
        rating: 5 
      }
    ],

    // ==================== FAQ ====================
    faq: [
      {
        category: "Admissions",
        icon: "📋",
        color: "#4299e1",
        questions: [
          { 
            id: 1, 
            question: "How can I apply for admission at Kitale Progressive School in Kitale, Kenya?", 
            answer: "You can apply through our <a href='/admissions/apply' class='text-navy fw-bold'>online admissions form</a> or visit the school in person. Our admissions team will guide you through the process.<br/><br/><a href='/admissions/apply' class='text-navy fw-bold'>Begin your application here →</a>" 
          },
          { 
            id: 2, 
            question: "Is there an admission interview or assessment?", 
            answer: "Yes. Depending on the grade level, learners may undergo a simple assessment to help us understand their current level.<br/><br/><b>Exceptions are for those beginning school for the first time.</b><br/><br/><a href='/contact' class='text-navy fw-bold'>Contact admissions</a> to schedule an assessment." 
          },
          { 
            id: 3, 
            question: "How do I know this is the right school for my child?", 
            answer: "The best way is to visit the school, meet our teachers, and experience the environment firsthand.<br/><br/><a href='/contact' class='text-navy fw-bold'>Book a school visit →</a>" 
          },
          { 
            id: 4, 
            question: "What are the school's hair and grooming guidelines for learners?", 
            answer: "At Kitale Progressive School, we maintain simple and neat grooming standards.<br/><br/><strong>For girls:</strong><br/>• Allowed styles include push-back styles, ponytails, half-lines, twists, and three-strand braids.<br/>• Hair should always be kept away from the face.<br/><br/><strong>For boys:</strong><br/>• Hair should be neatly shaved or kept short and clean." 
          }
        ]
      },
      {
        category: "Academics & Co-curricular",
        icon: "🏆",
        color: "#48bb78",
        questions: [
          { 
            id: 5, 
            question: "Which curriculum does Kitale Progressive School follow?", 
            answer: "We follow the <strong>Competency-Based Education (CBE)</strong>, which focuses on developing practical skills, creativity, and critical thinking.<br/><br/><a href='/academics/curriculum' class='text-navy fw-bold'>View full curriculum →</a>" 
          },
          { 
            id: 6, 
            question: "What is the average class size?", 
            answer: "We maintain manageable class sizes to ensure each learner receives adequate attention and support.<br/><br/><a href='/academics/curriculum' class='text-navy fw-bold'>Learn about our teaching approach →</a>" 
          },
          { 
            id: 7, 
            question: "What sports and clubs are available?", 
            answer: "Sports & clubs include Football, Volleyball, Netball, Handball, Taekwondo, Swimming, Chess, Music, Debate, Journalism, and Wildlife Club.<br/><br/><a href='/academics/clubs-societies' class='text-navy fw-bold'>View clubs & societies →</a>" 
          }
        ]
      },
      {
        category: "Boarding & Student Life",
        icon: "🏡",
        color: "#9f7aea",
        questions: [
          { 
            id: 8, 
            question: "What are the boarding facilities like?", 
            answer: "Our boarding facilities provide a safe, structured, and supportive environment.<br/><br/><a href='/school-life/boarding' class='text-navy fw-bold'>View boarding facilities →</a>" 
          },
          { 
            id: 9, 
            question: "How is security ensured for boarders?", 
            answer: "We prioritize student safety through controlled access, supervision, and structured routines." 
          },
          { 
            id: 10, 
            question: "What is the daily routine for boarders?", 
            answer: "Boarders follow a structured schedule: Wake up at 5:30 AM, morning prep, classes 8:00 AM–5:00 PM, evening prep, lights out at 9:00 PM.<br/><br/><a href='/school-life/events' class='text-navy fw-bold'>View events calendar →</a>" 
          }
        ]
      },
      {
        category: "Fees & Payments",
        icon: "💰",
        color: "#f56565",
        questions: [
          { 
            id: 11, 
            question: "How can parents pay school fees?", 
            answer: "Parents can choose between full payment before the term begins or a structured installment plan.<br/><br/><a href='/admissions/fee-structure' class='text-navy fw-bold'>View fee structure →</a>" 
          },
          { 
            id: 12, 
            question: "Are there any additional costs besides fees?", 
            answer: "All school fees are clearly outlined. Any additional costs are communicated in advance.<br/><br/><a href='/admissions/fee-structure' class='text-navy fw-bold'>View complete fee breakdown →</a>" 
          },
          { 
            id: 13, 
            question: "Does the school offer sibling discounts?", 
            answer: "Yes. 5% discount for second and subsequent children from the same family.<br/><br/><a href='/admissions/fee-structure' class='text-navy fw-bold'>View fee structure →</a>" 
          }
        ]
      },
      {
        category: "School Transport",
        icon: "🚌",
        color: "#ed8936",
        questions: [
          { 
            id: 14, 
            question: "Does the school provide transport?", 
            answer: "Yes. We provide reliable school transport services covering key areas within Kitale.<br/><br/><a href='/contact' class='text-navy fw-bold'>Contact transport office →</a>" 
          },
          { 
            id: 15, 
            question: "What are the school start and end times?", 
            answer: "School starts at 8:00 AM and ends at 5:00 PM from Monday to Friday.<br/><br/><a href='/school-life/events' class='text-navy fw-bold'>View school calendar →</a>" 
          }
        ]
      }
    ],

    // ==================== PARTNERS ====================
    partners: [],

    // ==================== FEE STRUCTURE ====================
    feeStructure: {
      ecde: { image: '/images/fee-structure/ecde.jpg', label: 'ECDE Fee Structure' },
      primary: { image: '/images/fee-structure/primary.jpg', label: 'Primary Fee Structure' },
      junior: { image: '/images/fee-structure/junior.jpg', label: 'Junior Secondary Fee Structure' },
      transport: { image: '/images/fee-structure/transport.jpg', label: 'Transport Costs' }
    },

    // ==================== PAGE CONTENT ====================
    pageContent: {
      homepage: {
        hero: { 
          title: 'Give Your Child the Foundation to Lead', 
          subtitle: 'Excellence in CBE education, grounded in Christian values and the warmth of the Kenyan spirit.' 
        },
        about: { 
          title: 'Are you looking for a school where your child will be known, nurtured, and inspired to succeed?', 
          content: 'At Kitale Progressive School, we believe every child carries unique potential. Our learning environment is designed to nurture curiosity, strengthen character, and build a strong academic foundation that prepares learners for the future.' 
        },
        why_choose_us: { 
          title: 'Why Parents Choose Kitale Progressive School', 
          intro: 'Parents choose Kitale Progressive School because we combine strong academic excellence with a nurturing and supportive environment.', 
          items: [] 
        }
      },
      about: {
        hero: { 
          title: 'About Kitale Progressive School', 
          subtitle: 'Learn about our history, mission, and values.' 
        },
        content: { 
          title: 'Our Story', 
          content: 'Kitale Progressive School was founded with a vision to provide quality education that nurtures every child\'s potential. We are committed to excellence, integrity, discipline, and compassion.', 
          mission: 'To provide quality education that nurtures every child\'s potential.', 
          vision: 'To be a leading institution in holistic education.', 
          values: 'Excellence, Integrity, Discipline, Compassion' 
        }
      },
      academics: {
        hero: { 
          title: 'Academics at Kitale Progressive School', 
          subtitle: 'A comprehensive approach to learning and development.' 
        },
        content: { 
          title: 'Our Academic Programs', 
          content: 'We offer a comprehensive academic program that prepares learners for success in higher education and beyond.' 
        }
      },
      curriculum: {
        hero: { 
          title: 'Our Curriculum', 
          subtitle: 'Competency-Based Education (CBE) approved by KICD.' 
        },
        content: { 
          title: 'Curriculum Overview', 
          content: 'Our curriculum focuses on developing practical skills, creativity, and critical thinking through the Competency-Based Education framework.' 
        }
      },
      clubs: {
        hero: { 
          title: 'Clubs & Societies', 
          subtitle: 'Discover your passion and develop new skills.' 
        },
        content: { 
          title: 'Co-Curricular Activities', 
          content: 'We offer a wide range of clubs and societies to develop talents and interests including sports, music, drama, debate, and more.' 
        }
      },
      boarding: {
        hero: { 
          title: 'A Safe and Structured Boarding Experience', 
          subtitle: 'Our boarding program provides a structured, disciplined and supportive environment where learners live, study and grow under the care of experienced and attentive staff.' 
        },
        overview: { 
          title: 'What Your Child Will Experience', 
          content: 'Every day in our boarding program is designed to support academic success and personal growth.' 
        },
        experience: { 
          title: 'Comfortable Living Spaces', 
          content: 'Our dormitories are thoughtfully designed to be a true home away from home. Each room is bright, well-ventilated, and generously spacious, offering plenty of room to live, study, and unwind.' 
        },
        study: { 
          title: 'Supervised Study Time', 
          content: 'Evening prep sessions are supervised by qualified teachers who provide academic support and ensure homework completion.' 
        },
        recreation: { 
          title: 'Recreation & Wellness', 
          content: 'We believe in holistic development. Our boarding students have access to sports facilities, common rooms with recreational activities.' 
        },
        parent_expectations: { 
          title: 'What to Expect as a Parent', 
          content: 'You can expect regular communication about your child\'s progress, a safe and nurturing environment, and a structured routine that promotes discipline and academic focus.' 
        },
        outcomes: { 
          title: 'Learners Develop', 
          content: 'Independence, responsibility, discipline, and strong academic foundations through structured routines and expectations.' 
        },
        routine: { 
          title: 'Daily Routine for Boarders', 
          content: 'A structured daily schedule including morning prep, classes, sports, evening preps, and supervised study time.' 
        },
        checklist: { 
          title: 'Boarding Checklist', 
          content: 'Essential Items Your Child will need for Boarding' 
        }
      },
      dining: {
        hero: { 
          title: 'Nutritious Meals Every Day', 
          subtitle: 'Balanced, healthy meals prepared with care.' 
        },
        content: { 
          title: 'Dining at KPS', 
          content: 'We provide nutritious, balanced meals to support your child\'s health, energy, and academic performance.' 
        }
      },
      gallery: {
        hero: { 
          title: 'Our Gallery', 
          subtitle: 'A glimpse into daily life at Kitale Progressive School.' 
        },
        content: { 
          title: 'School Life', 
          content: 'Explore our school through photos and videos showcasing academic activities, sports events, cultural celebrations, and modern facilities.' 
        }
      },
      faq: {
        hero: { 
          title: 'Frequently Asked Questions', 
          subtitle: 'Find answers to your questions about admissions, curriculum, boarding, fees, and more.' 
        },
        content: { 
          title: 'FAQ', 
          content: 'Find answers to common questions about our school.' 
        }
      },
      fee_structure: {
        hero: { 
          title: 'Clear, Flexible, and Value-Driven School Fees', 
          subtitle: 'Transparent and manageable fee structure designed to balance affordability with quality education.' 
        },
        content: { 
          title: 'Fee Structure', 
          content: 'Our fee structure is designed to balance affordability with quality education, ensuring your child receives a well-rounded learning experience.' 
        }
      },
      apply: {
        hero: { 
          title: 'Apply Now', 
          subtitle: 'Start your child\'s journey at Kitale Progressive School.' 
        },
        content: { 
          title: 'Application Process', 
          content: 'Complete the application form to begin the admissions process. Our team will guide you through every step.' 
        }
      },
      contact: {
        hero: { 
          title: 'Get In Touch', 
          subtitle: 'We\'re here to answer your questions.' 
        },
        content: { 
          title: 'Contact Us', 
          content: 'Reach out to us for any inquiries about admissions, academics, boarding, or anything else.' 
        }
      },
      partner: {
        hero: { 
          title: 'Partner With Us', 
          subtitle: 'Collaborate with us to expand access to quality education.' 
        },
        content: { 
          title: 'Partnership Opportunities', 
          content: 'We welcome partners who share our vision of providing quality education and expanding access to deserving learners.' 
        }
      },
      blog: {
        hero: { 
          title: 'Blog', 
          subtitle: 'Insights and stories from Kitale Progressive School.' 
        },
        content: { 
          title: 'Latest Posts', 
          content: 'Stay updated with our latest articles and news.' 
        }
      },
      privacy_policy: {
        hero: { 
          title: 'Privacy Policy', 
          subtitle: 'How we protect and handle your information.' 
        },
        content: { 
          title: 'Privacy Policy', 
          content: 'Read our privacy policy to understand how we handle your data.' 
        }
      },
      terms: {
        hero: { 
          title: 'Terms of Service', 
          subtitle: 'Please read these terms carefully.' 
        },
        content: { 
          title: 'Terms of Service', 
          content: 'Read our terms of service.' 
        }
      }
    },

    // ==================== FOOTER SETTINGS ====================
    footerSettings: {
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
    },

    // ==================== SETTINGS ====================
    settings: {
      schoolName: "Kitale Progressive School",
      schoolEmail: "kitaleprogressivesocial@gmail.com",
      schoolPhone: "+254 736 756 595",
      schoolAddress: "Kitale - Kapenguria RD",
      facebookUrl: "https://www.facebook.com/kitaleprogressive/",
      instagramUrl: "https://www.instagram.com/kitaleprogrsv1338/",
      youtubeUrl: "https://www.youtube.com/@KPSConnect",
      tiktokUrl: "https://www.tiktok.com/@kitale.progressive",
      whatsappUrl: "https://wa.me/254780841116",
      googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.1549118880284!2d34.995235373490296!3d1.0448587624833654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x178226623113cbbd%3A0x9bc6b39a5f193f4a!2sKitale%20Progressive%20School%3A%20Top%20Private%20Christian%20School%20in%20Trans%20Nzoia%3A!5e0!3m2!1sen!2ske!4v1777746404738!5m2!1sen!2ske"
    }
  };

  return defaults[key] || [];
};

// ==================== BLOGS ====================
export const getBlogs = async () => await getCollection(KEYS.BLOGS);
export const saveBlogs = async (data) => await saveCollection(KEYS.BLOGS, data);
export const addBlog = async (blog) => {
  const blogs = await getBlogs();
  const newBlog = { ...blog, id: Date.now() };
  blogs.push(newBlog);
  await saveBlogs(blogs);
  return newBlog;
};
export const updateBlog = async (id, updatedData) => {
  const blogs = await getBlogs();
  const index = blogs.findIndex(b => b.id === id);
  if (index === -1) return null;
  blogs[index] = { ...blogs[index], ...updatedData };
  await saveBlogs(blogs);
  return blogs[index];
};
export const deleteBlog = async (id) => {
  const blogs = await getBlogs();
  const filtered = blogs.filter(b => b.id !== id);
  await saveBlogs(filtered);
  return true;
};

// ==================== EVENTS ====================
export const getEvents = async () => await getCollection(KEYS.EVENTS);
export const saveEvents = async (data) => await saveCollection(KEYS.EVENTS, data);
export const addEvent = async (event) => {
  const events = await getEvents();
  const newEvent = { ...event, id: Date.now() };
  events.push(newEvent);
  await saveEvents(events);
  return newEvent;
};
export const updateEvent = async (id, updatedData) => {
  const events = await getEvents();
  const index = events.findIndex(e => e.id === id);
  if (index === -1) return null;
  events[index] = { ...events[index], ...updatedData };
  await saveEvents(events);
  return events[index];
};
export const deleteEvent = async (id) => {
  const events = await getEvents();
  const filtered = events.filter(e => e.id !== id);
  await saveEvents(filtered);
  return true;
};

// ==================== GALLERY ====================
export const getGallery = async () => await getCollection(KEYS.GALLERY);
export const saveGallery = async (data) => await saveCollection(KEYS.GALLERY, data);
export const addGalleryImage = async (image) => {
  const gallery = await getGallery();
  const newImage = { ...image, id: Date.now() };
  gallery.push(newImage);
  await saveGallery(gallery);
  return newImage;
};
export const deleteGalleryImage = async (id) => {
  const gallery = await getGallery();
  const filtered = gallery.filter(img => img.id !== id);
  await saveGallery(filtered);
  return true;
};

// ==================== TESTIMONIALS ====================
export const getTestimonials = async () => await getCollection(KEYS.TESTIMONIALS);
export const saveTestimonials = async (data) => await saveCollection(KEYS.TESTIMONIALS, data);
export const addTestimonial = async (testimonial) => {
  const testimonials = await getTestimonials();
  const newTestimonial = { ...testimonial, id: Date.now() };
  testimonials.push(newTestimonial);
  await saveTestimonials(testimonials);
  return newTestimonial;
};
export const updateTestimonial = async (id, updatedData) => {
  const testimonials = await getTestimonials();
  const index = testimonials.findIndex(t => t.id === id);
  if (index === -1) return null;
  testimonials[index] = { ...testimonials[index], ...updatedData };
  await saveTestimonials(testimonials);
  return testimonials[index];
};
export const deleteTestimonial = async (id) => {
  const testimonials = await getTestimonials();
  const filtered = testimonials.filter(t => t.id !== id);
  await saveTestimonials(filtered);
  return true;
};

// ==================== FAQ ====================
export const getFAQ = async () => await getCollection(KEYS.FAQ);
export const saveFAQ = async (data) => await saveCollection(KEYS.FAQ, data);

// ==================== PARTNERS ====================
export const getPartners = async () => await getCollection(KEYS.PARTNERS);
export const savePartners = async (data) => await saveCollection(KEYS.PARTNERS, data);
export const addPartner = async (partner) => {
  const partners = await getPartners();
  const newPartner = { ...partner, id: Date.now() };
  partners.push(newPartner);
  await savePartners(partners);
  return newPartner;
};
export const updatePartner = async (id, updatedData) => {
  const partners = await getPartners();
  const index = partners.findIndex(p => p.id === id);
  if (index === -1) return null;
  partners[index] = { ...partners[index], ...updatedData };
  await savePartners(partners);
  return partners[index];
};
export const deletePartner = async (id) => {
  const partners = await getPartners();
  const filtered = partners.filter(p => p.id !== id);
  await savePartners(filtered);
  return true;
};

// ==================== FEE STRUCTURE ====================
export const getFeeStructure = async () => await getCollection(KEYS.FEE_STRUCTURE);
export const saveFeeStructure = async (data) => await saveCollection(KEYS.FEE_STRUCTURE, data);

// ==================== PAGE CONTENT ====================
export const getPageContent = async () => await getCollection(KEYS.PAGE_CONTENT);
export const savePageContent = async (data) => await saveCollection(KEYS.PAGE_CONTENT, data);

// ==================== FOOTER SETTINGS ====================
export const getFooterSettings = async () => await getCollection(KEYS.FOOTER_SETTINGS);
export const saveFooterSettings = async (data) => await saveCollection(KEYS.FOOTER_SETTINGS, data);

// ==================== SETTINGS ====================
export const getSettings = async () => await getCollection(KEYS.SETTINGS);
export const saveSettings = async (data) => await saveCollection(KEYS.SETTINGS, data);

// ==================== EXPORT updateData INDIVIDUALLY ====================
export { updateData };

// ==================== DEFAULT EXPORT ====================
export default {
  getBlogs, saveBlogs, addBlog, updateBlog, deleteBlog,
  getEvents, saveEvents, addEvent, updateEvent, deleteEvent,
  getGallery, saveGallery, addGalleryImage, deleteGalleryImage,
  getTestimonials, saveTestimonials, addTestimonial, updateTestimonial, deleteTestimonial,
  getFAQ, saveFAQ,
  getPartners, savePartners, addPartner, updatePartner, deletePartner,
  getFeeStructure, saveFeeStructure,
  getPageContent, savePageContent,
  getFooterSettings, saveFooterSettings,
  getSettings, saveSettings,
  updateData,
};