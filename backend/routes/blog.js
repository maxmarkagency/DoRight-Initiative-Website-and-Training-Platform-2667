import express from 'express';
import { adminClient, userClient } from '../config/supabase.js';
import { authenticateToken, requireRole } from '../middleware/supabaseAuth.js';
import { AppError } from '../middleware/errorHandler.js';
import winston from 'winston';

const router = express.Router();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/blog.log' }),
    new winston.transports.Console()
  ]
});

/**
 * GET /api/blog
 * Get all blog posts (public: only published, admin: all)
 */
router.get('/', async (req, res, next) => {
  try {
    const { status, category, search, limit = 10, offset = 0 } = req.query;
    
    let query = userClient
      .from('blog_posts')
      .select('*, users(email, full_name)', { count: 'exact' });

    // Public users only see published posts
    if (!req.user || req.user.role === 'user') {
      query = query.eq('status', 'published');
    } else if (status) {
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

    if (error) throw error;

    res.json({
      success: true,
      posts: data,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    logger.error('Error fetching blog posts:', error);
    next(new AppError('Failed to fetch blog posts', 500));
  }
});

/**
 * GET /api/blog/:id
 * Get a single blog post
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    let query = userClient
      .from('blog_posts')
      .select('*, users(email, full_name)')
      .eq('id', id)
      .single();

    const { data, error } = await query;

    if (error) {
      if (error.code === 'PGRST116') {
        return next(new AppError('Blog post not found', 404));
      }
      throw error;
    }

    // Check if user can view unpublished posts
    if (data.status !== 'published' && (!req.user || !['admin', 'staff'].includes(req.user.role))) {
      return next(new AppError('Blog post not found', 404));
    }

    res.json({
      success: true,
      post: data
    });
  } catch (error) {
    logger.error('Error fetching blog post:', error);
    next(new AppError('Failed to fetch blog post', 500));
  }
});

/**
 * POST /api/blog
 * Create a new blog post (admin/staff only)
 */
router.post('/', authenticateToken, requireRole(['admin', 'staff']), async (req, res, next) => {
  try {
    const { title, slug, content, excerpt, featured_image_url, status, tags } = req.body;

    if (!title || !slug || !content) {
      return next(new AppError('Title, slug, and content are required', 400));
    }

    const postData = {
      title,
      slug,
      content,
      excerpt,
      featured_image_url,
      author_id: req.user.id,
      status: status || 'draft',
      tags: tags || [],
      published_at: status === 'published' ? new Date().toISOString() : null
    };

    const { data, error } = await adminClient
      .from('blog_posts')
      .insert(postData)
      .select('*, users(email, full_name)')
      .single();

    if (error) {
      if (error.code === '23505') {
        return next(new AppError('A post with this slug already exists', 409));
      }
      throw error;
    }

    logger.info(`Blog post created: ${data.id}`, { user: req.user.id });

    res.status(201).json({
      success: true,
      post: data
    });
  } catch (error) {
    logger.error('Error creating blog post:', error);
    next(new AppError('Failed to create blog post', 500));
  }
});

/**
 * PUT /api/blog/:id
 * Update a blog post (admin/staff only)
 */
router.put('/:id', authenticateToken, requireRole(['admin', 'staff']), async (req, res, next) => {
  try {
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

    const { data, error } = await adminClient
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
      .select('*, users(email, full_name)')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return next(new AppError('Blog post not found', 404));
      }
      if (error.code === '23505') {
        return next(new AppError('A post with this slug already exists', 409));
      }
      throw error;
    }

    logger.info(`Blog post updated: ${id}`, { user: req.user.id });

    res.json({
      success: true,
      post: data
    });
  } catch (error) {
    logger.error('Error updating blog post:', error);
    next(new AppError('Failed to update blog post', 500));
  }
});

/**
 * DELETE /api/blog/:id
 * Delete a blog post (admin only)
 */
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await adminClient
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return next(new AppError('Blog post not found', 404));
      }
      throw error;
    }

    logger.info(`Blog post deleted: ${id}`, { user: req.user.id });

    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting blog post:', error);
    next(new AppError('Failed to delete blog post', 500));
  }
});

export default router;