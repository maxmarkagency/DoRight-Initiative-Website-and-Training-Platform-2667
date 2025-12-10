import { supabaseAdmin } from '../config/supabase.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ]
});

export async function seedBlogAndGalleryData() {
  try {
    console.log('🌱 Starting to seed blog and gallery data...');
    
    // Sample blog posts data
    const sampleBlogPosts = [
      {
        title: "Welcome to DoRight Foundation",
        slug: "welcome-to-doright-foundation",
        content: `
# Welcome to DoRight Foundation

We are excited to announce the launch of our new learning management system! This platform has been designed to provide high-quality education and training opportunities to learners from all walks of life.

## Our Mission

DoRight Foundation is committed to making quality education accessible to everyone. We believe that education is the key to unlocking human potential and creating positive change in communities.

## What We Offer

- **Online Courses**: Comprehensive courses in various fields
- **Expert Instructors**: Learn from industry professionals
- **Flexible Learning**: Study at your own pace
- **Community Support**: Connect with fellow learners
- **Certificates**: Earn recognized certificates upon completion

## Get Started

Browse our catalog of courses and start your learning journey today!

This platform represents a new chapter in educational accessibility. We're here to support you every step of the way in your learning journey.
        `,
        excerpt: "Discover our new learning platform designed to provide quality education and training opportunities to learners from all walks of life.",
        featured_image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop",
        status: 'published',
        published_at: new Date().toISOString(),
        tags: ['announcement', 'education', 'platform']
      },
      {
        title: "The Future of Online Learning",
        slug: "future-of-online-learning",
        content: `
# The Future of Online Learning

Online learning has revolutionized the way we approach education. As technology continues to advance, we're seeing exciting developments that will shape the future of learning.

## Key Trends

### 1. Personalized Learning Paths
AI-powered systems can now create customized learning experiences based on individual needs and learning styles.

### 2. Virtual Reality in Education
VR technology is making it possible to create immersive learning environments that were previously unimaginable.

### 3. Microlearning
Short, focused learning sessions that fit into busy schedules are becoming increasingly popular.

### 4. Collaborative Learning
Digital platforms are making it easier than ever for learners to collaborate and learn from each other.

## Benefits of Online Learning

- **Flexibility**: Learn anytime, anywhere
- **Affordability**: Often more cost-effective than traditional education
- **Variety**: Access to courses from institutions worldwide
- **Self-Paced**: Learn at your own speed
- **Access to Experts**: Learn from leading professionals globally

## Looking Ahead

The future of online learning looks brighter than ever. With continued technological innovation and growing demand for flexible education, we're entering an exciting new era of learning.

At DoRight Foundation, we're committed to staying at the forefront of these developments to provide our learners with the best possible educational experience.
        `,
        excerpt: "Explore the exciting trends shaping the future of online education, from AI-powered personalization to virtual reality learning environments.",
        featured_image_url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=400&fit=crop",
        status: 'published',
        published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        tags: ['technology', 'future', 'education', 'innovation']
      },
      {
        title: "Building Strong Communities Through Education",
        slug: "building-strong-communities-through-education",
        content: `
# Building Strong Communities Through Education

Education has always been a cornerstone of community development. In today's interconnected world, the role of education in community building has become more important than ever.

## The Connection Between Education and Community

When we invest in education, we're not just investing in individuals – we're investing in entire communities. Here's how education strengthens communities:

### Economic Development
Education equips people with skills needed for better employment opportunities, which in turn improves local economies.

### Social Cohesion
Shared learning experiences bring people together, fostering understanding and collaboration across different backgrounds.

### Civic Engagement
Educated citizens are more likely to participate in democratic processes and contribute to community decision-making.

### Innovation and Problem-Solving
Communities with educated populations are better equipped to tackle local challenges and innovate solutions.

## DoRight's Community Approach

At DoRight Foundation, we believe in:

- **Accessible Education**: Making learning opportunities available to all community members
- **Local Partnerships**: Collaborating with local organizations and businesses
- **Skills Development**: Focusing on practical skills that communities need
- **Social Impact**: Measuring success not just by individual achievement, but by community progress

## Success Stories

Our programs have helped communities across the region:
- Increased local employment rates
- Improved access to healthcare through health education programs
- Enhanced digital literacy across all age groups
- Strengthened local business networks

## Getting Involved

There are many ways to contribute to community education:
- Volunteer as a mentor or tutor
- Share your expertise through workshops
- Support scholarship programs
- Advocate for education funding

Together, we can build stronger, more resilient communities through the power of education.
        `,
        excerpt: "Discover how education serves as a foundation for community development, fostering economic growth, social cohesion, and civic engagement.",
        featured_image_url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=400&fit=crop",
        status: 'published',
        published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        tags: ['community', 'social impact', 'development', 'education']
      }
    ];

    // Sample gallery items data
    const sampleGalleryItems = [
      {
        title: "Students in Our Computer Lab",
        description: "Students working on computers in our modern computer lab, equipped with the latest technology for digital skills training.",
        media_url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop",
        thumbnail_url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=200&fit=crop",
        media_type: 'image',
        category: 'Facilities',
        position: 1,
        is_featured: true
      },
      {
        title: "Community Workshop Session",
        description: "A lively community workshop where participants learn new skills and share experiences in a collaborative environment.",
        media_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop",
        thumbnail_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop",
        media_type: 'image',
        category: 'Events',
        position: 2,
        is_featured: true
      },
      {
        title: "Graduation Ceremony",
        description: "Our recent graduation ceremony celebrating the achievements of our students who completed various certification programs.",
        media_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop",
        thumbnail_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300&h=200&fit=crop",
        media_type: 'image',
        category: 'Graduation',
        position: 3,
        is_featured: true
      },
      {
        title: "Digital Skills Training",
        description: "Participants learning essential digital skills including coding, web development, and digital marketing.",
        media_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop",
        thumbnail_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop",
        media_type: 'image',
        category: 'Training',
        position: 4,
        is_featured: false
      },
      {
        title: "Community Garden Project",
        description: "Our environmental education program where students learn about sustainable agriculture and environmental stewardship.",
        media_url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop",
        thumbnail_url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop",
        media_type: 'image',
        category: 'Environment',
        position: 5,
        is_featured: false
      },
      {
        title: "Youth Leadership Workshop",
        description: "Young leaders from the community participating in a leadership development workshop focused on civic engagement.",
        media_url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop",
        thumbnail_url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=300&h=200&fit=crop",
        media_type: 'image',
        category: 'Leadership',
        position: 6,
        is_featured: false
      }
    ];

    // Insert blog posts
    console.log('📝 Inserting sample blog posts...');
    const { data: blogData, error: blogError } = await supabaseAdmin
      .from('blog_posts')
      .insert(sampleBlogPosts)
      .select();

    if (blogError) {
      console.log('❌ Error inserting blog posts:', blogError.message);
    } else {
      console.log('✅ Successfully inserted', blogData.length, 'blog posts');
    }

    // Insert gallery items
    console.log('🖼️ Inserting sample gallery items...');
    const { data: galleryData, error: galleryError } = await supabaseAdmin
      .from('gallery_items')
      .insert(sampleGalleryItems)
      .select();

    if (galleryError) {
      console.log('❌ Error inserting gallery items:', galleryError.message);
    } else {
      console.log('✅ Successfully inserted', galleryData.length, 'gallery items');
    }

    console.log('🌱 Seeding completed successfully!');
    return {
      success: true,
      blogPosts: blogData?.length || 0,
      galleryItems: galleryData?.length || 0
    };

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// For manual execution
if (import.meta.url === `file://${process.argv[1]}`) {
  seedBlogAndGalleryData().then((result) => {
    if (result.success) {
      console.log('🎉 Seed data added successfully!');
      console.log(`📝 Blog posts: ${result.blogPosts}`);
      console.log(`🖼️ Gallery items: ${result.galleryItems}`);
    } else {
      console.error('❌ Seeding failed:', result.error);
    }
    process.exit(result.success ? 0 : 1);
  });
}

export default seedBlogAndGalleryData;