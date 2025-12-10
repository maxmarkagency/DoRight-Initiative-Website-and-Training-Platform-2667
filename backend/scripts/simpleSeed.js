import { supabaseAdmin } from '../config/supabase.js';

console.log('🌱 Simple data seeding starting...');

try {
  // Simple test to insert one blog post
  const testBlogPost = {
    title: "Welcome to DoRight Foundation",
    slug: "welcome-to-doright-foundation",
    content: "This is our first blog post about DoRight Foundation and our mission to provide quality education.",
    excerpt: "Welcome to our learning platform!",
    featured_image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop",
    status: 'published',
    published_at: new Date().toISOString(),
    tags: ['announcement', 'education']
  };

  const insertResult = supabaseAdmin
    .from('blog_posts')
    .insert([testBlogPost])
    .select();

  insertResult.then(({ data, error }) => {
    if (error) {
      console.log('❌ Insert error:', error.message);
    } else {
      console.log('✅ Successfully inserted blog post:', data[0]?.title);
    }
    
    // Also test gallery
    const testGalleryItem = {
      title: "Test Gallery Image",
      description: "A test gallery item to verify functionality",
      media_url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop",
      thumbnail_url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=200&fit=crop",
      media_type: 'image',
      category: 'Test',
      position: 1,
      is_featured: false
    };

    return supabaseAdmin
      .from('gallery_items')
      .insert([testGalleryItem])
      .select();
  }).then(({ data, error }) => {
    if (error) {
      console.log('❌ Gallery insert error:', error.message);
    } else {
      console.log('✅ Successfully inserted gallery item:', data[0]?.title);
    }
    
    console.log('🌱 Simple seeding completed!');
    process.exit(0);
  }).catch(err => {
    console.log('❌ Seeding failed:', err.message);
    process.exit(1);
  });

} catch (e) {
  console.log('❌ Script error:', e.message);
  process.exit(1);
}