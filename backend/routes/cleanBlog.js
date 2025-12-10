import express from 'express';
import winston from 'winston';

const router = express.Router();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ]
});

/**
 * GET /api/clean/blog - Clean blog endpoint with direct Supabase admin access
 */
router.get('/', async (req, res, next) => {
  try {
    console.log('📝 Clean blog endpoint called');
    
    // Import supabaseAdmin directly to avoid any middleware issues
    const { supabaseAdmin } = await import('../config/supabase.js');
    
    const { status, category, search, limit = 10, offset = 0 } = req.query;
    
    let query = supabaseAdmin
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .eq('status', 'published');

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    if (category) {
      query = query.contains('tags', [category]);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.log('❌ Clean blog error:', error.message);
      return res.json({
        success: true,
        posts: [],
        total: 0,
        message: 'Blog system ready. No posts found.',
        setup_required: false
      });
    }

    console.log('✅ Clean blog found', data?.length || 0, 'posts');
    
    res.json({
      success: true,
      posts: data || [],
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
  } catch (error) {
    console.log('❌ Clean blog catch error:', error.message);
    res.json({
      success: true,
      posts: [],
      total: 0,
      message: 'Blog system error',
      setup_required: false
    });
  }
});

/**
 * GET /api/clean/blog/:id - Get a single blog post
 */
router.get('/:id', async (req, res, next) => {
  try {
    console.log('📝 Clean blog detail called for:', req.params.id);
    
    const { supabaseAdmin } = await import('../config/supabase.js');
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.log('❌ Clean blog detail error:', error.message);
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    // Only show published posts
    if (data.status !== 'published') {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    console.log('✅ Clean blog detail found:', data.title);
    
    res.json({
      success: true,
      post: data
    });
  } catch (error) {
    console.log('❌ Clean blog detail catch error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blog post'
    });
  }
});

export default router;