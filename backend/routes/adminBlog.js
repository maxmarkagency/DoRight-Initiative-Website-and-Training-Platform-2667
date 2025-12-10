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
 * GET /api/admin/blog - Admin blog endpoint (shows all posts)
 */
router.get('/', async (req, res, next) => {
  try {
    console.log('📝 Admin blog endpoint called');
    
    // Import supabaseAdmin directly to avoid any middleware issues
    const { supabaseAdmin } = await import('../config/supabase.js');
    
    const { status, category, search, limit = 10, offset = 0 } = req.query;
    
    let query = supabaseAdmin
      .from('blog_posts')
      .select('*', { count: 'exact' });

    // For admin, show all posts regardless of status
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

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
      console.log('❌ Admin blog error:', error.message);
      return res.json({
        success: true,
        posts: [],
        total: 0,
        message: 'Admin blog system ready. No posts found.',
        setup_required: false
      });
    }

    console.log('✅ Admin blog found', data?.length || 0, 'posts');
    
    res.json({
      success: true,
      posts: data || [],
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
  } catch (error) {
    console.log('❌ Admin blog catch error:', error.message);
    res.json({
      success: true,
      posts: [],
      total: 0,
      message: 'Admin blog system error',
      setup_required: false
    });
  }
});

/**
 * POST /api/admin/blog - Create a new blog post
 */
router.post('/', async (req, res, next) => {
  try {
    console.log('📝 Admin blog create called');
    
    const { supabaseAdmin } = await import('../config/supabase.js');
    const { title, slug, content, excerpt, featured_image_url, status, tags } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({
        success: false,
        error: 'Title, slug, and content are required'
      });
    }

    const postData = {
      title,
      slug,
      content,
      excerpt,
      featured_image_url,
      status: status || 'draft',
      published_at: status === 'published' ? new Date().toISOString() : null,
      tags: tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .insert(postData)
      .select()
      .single();

    if (error) {
      console.log('❌ Admin blog create error:', error.message);
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          error: 'A post with this slug already exists'
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to create blog post'
      });
    }

    console.log('✅ Admin blog created:', data.title);
    
    res.status(201).json({
      success: true,
      post: data
    });
  } catch (error) {
    console.log('❌ Admin blog create catch error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create blog post'
    });
  }
});

/**
 * PUT /api/admin/blog/:id - Update a blog post
 */
router.put('/:id', async (req, res, next) => {
  try {
    console.log('📝 Admin blog update called for:', req.params.id);
    
    const { supabaseAdmin } = await import('../config/supabase.js');
    const { id } = req.params;
    const { title, slug, content, excerpt, featured_image_url, status, tags } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (slug) updateData.slug = slug;
    if (content) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (featured_image_url !== undefined) updateData.featured_image_url = featured_image_url;
    if (status) {
      updateData.status = status;
      if (status === 'published' && !updateData.published_at) {
        updateData.published_at = new Date().toISOString();
      }
    }
    if (tags) updateData.tags = tags;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.log('❌ Admin blog update error:', error.message);
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Blog post not found'
        });
      }
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          error: 'A post with this slug already exists'
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to update blog post'
      });
    }

    console.log('✅ Admin blog updated:', data.title);
    
    res.json({
      success: true,
      post: data
    });
  } catch (error) {
    console.log('❌ Admin blog update catch error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to update blog post'
    });
  }
});

/**
 * DELETE /api/admin/blog/:id - Delete a blog post
 */
router.delete('/:id', async (req, res, next) => {
  try {
    console.log('📝 Admin blog delete called for:', req.params.id);
    
    const { supabaseAdmin } = await import('../config/supabase.js');
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.log('❌ Admin blog delete error:', error.message);
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Blog post not found'
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to delete blog post'
      });
    }

    console.log('✅ Admin blog deleted:', id);
    
    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.log('❌ Admin blog delete catch error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete blog post'
    });
  }
});

export default router;