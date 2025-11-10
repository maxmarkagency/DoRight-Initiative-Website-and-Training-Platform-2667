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
    new winston.transports.File({ filename: 'logs/gallery.log' }),
    new winston.transports.Console()
  ]
});

/**
 * GET /api/gallery
 * Get all gallery items (public)
 */
router.get('/', async (req, res, next) => {
  try {
    const { category, featured, limit = 20, offset = 0 } = req.query;
    
    let query = userClient
      .from('gallery_items')
      .select('*', { count: 'exact' });

    if (category) {
      query = query.eq('category', category);
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    const { data, error, count } = await query
      .order('position', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      success: true,
      items: data,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    logger.error('Error fetching gallery items:', error);
    next(new AppError('Failed to fetch gallery items', 500));
  }
});

/**
 * GET /api/gallery/:id
 * Get a single gallery item
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await userClient
      .from('gallery_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return next(new AppError('Gallery item not found', 404));
      }
      throw error;
    }

    res.json({
      success: true,
      item: data
    });
  } catch (error) {
    logger.error('Error fetching gallery item:', error);
    next(new AppError('Failed to fetch gallery item', 500));
  }
});

/**
 * POST /api/gallery
 * Create a new gallery item (admin/staff only)
 */
router.post('/', authenticateToken, requireRole(['admin', 'staff']), async (req, res, next) => {
  try {
    const { 
      title, 
      description, 
      media_url, 
      thumbnail_url, 
      media_type, 
      category, 
      position, 
      is_featured 
    } = req.body;

    if (!title || !media_url) {
      return next(new AppError('Title and media URL are required', 400));
    }

    const itemData = {
      title,
      description,
      media_url,
      thumbnail_url,
      media_type: media_type || 'image',
      category,
      position: position || 0,
      is_featured: is_featured || false
    };

    const { data, error } = await adminClient
      .from('gallery_items')
      .insert(itemData)
      .select()
      .single();

    if (error) throw error;

    logger.info(`Gallery item created: ${data.id}`, { user: req.user.id });

    res.status(201).json({
      success: true,
      item: data
    });
  } catch (error) {
    logger.error('Error creating gallery item:', error);
    next(new AppError('Failed to create gallery item', 500));
  }
});

/**
 * PUT /api/gallery/:id
 * Update a gallery item (admin/staff only)
 */
router.put('/:id', authenticateToken, requireRole(['admin', 'staff']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      media_url, 
      thumbnail_url, 
      media_type, 
      category, 
      position, 
      is_featured 
    } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (media_url) updateData.media_url = media_url;
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url;
    if (media_type) updateData.media_type = media_type;
    if (category !== undefined) updateData.category = category;
    if (position !== undefined) updateData.position = position;
    if (is_featured !== undefined) updateData.is_featured = is_featured;

    const { data, error } = await adminClient
      .from('gallery_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return next(new AppError('Gallery item not found', 404));
      }
      throw error;
    }

    logger.info(`Gallery item updated: ${id}`, { user: req.user.id });

    res.json({
      success: true,
      item: data
    });
  } catch (error) {
    logger.error('Error updating gallery item:', error);
    next(new AppError('Failed to update gallery item', 500));
  }
});

/**
 * DELETE /api/gallery/:id
 * Delete a gallery item (admin only)
 */
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await adminClient
      .from('gallery_items')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return next(new AppError('Gallery item not found', 404));
      }
      throw error;
    }

    logger.info(`Gallery item deleted: ${id}`, { user: req.user.id });

    res.json({
      success: true,
      message: 'Gallery item deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting gallery item:', error);
    next(new AppError('Failed to delete gallery item', 500));
  }
});

export default router;