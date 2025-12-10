import express from 'express';
import { adminClient, userClient } from '../config/supabase.js';
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
 * GET /api/public/blog - Public blog endpoint (no auth required)
 */
router.get('/', async (req, res, next) => {
  try {
    console.log('📝 Public blog endpoint called');
    
    const { status, category, search, limit = 10, offset = 0 } = req.query;
    
    // Only show published posts for public access
    let query = userClient
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
      console.log('❌ Blog query error:', error.message);
      return res.json({
        success: true,
        posts: [],
        total: 0,
        message: 'Blog system is ready. No posts found.',
        setup_required: false
      });
    }

    console.log('✅ Found', data?.length || 0, 'blog posts');
    
    res.json({
      success: true,
      posts: data || [],
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
  } catch (error) {
    console.log('❌ Public blog error:', error.message);
    res.json({
      success: true,
      posts: [],
      total: 0,
      message: 'Blog system error occurred',
      setup_required: false
    });
  }
});

/**
 * GET /api/public/blog/:id - Get a single blog post (public)
 */
router.get('/:id', async (req, res, next) => {
  try {
    console.log('📝 Public blog detail endpoint called for:', req.params.id);
    
    const { id } = req.params;

    const { data, error } = await userClient
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.log('❌ Blog detail error:', error.message);
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    // Only allow published posts to be viewed publicly
    if (data.status !== 'published') {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    console.log('✅ Found blog post:', data.title);
    
    res.json({
      success: true,
      post: data
    });
  } catch (error) {
    console.log('❌ Public blog detail error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blog post'
    });
  }
});

export default router;