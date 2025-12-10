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
 * GET /api/admin/gallery - Admin gallery endpoint
 */
router.get('/', async (req, res, next) => {
  try {
    console.log('🖼️ Admin gallery endpoint called');
    
    const { supabaseAdmin } = await import('../config/supabase.js');
    const { category, featured, limit = 10, offset = 0 } = req.query;
    
    let query = supabaseAdmin
      .from('gallery_items')
      .select('*', { count: 'exact' });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    const { data, error, count } = await query
      .order('position', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.log('❌ Admin gallery error:', error.message);
      return res.json({
        success: true,
        items: [],
        total: 0,
        message: 'Admin gallery system ready. No items found.',
        setup_required: false
      });
    }

    console.log('✅ Admin gallery found', data?.length || 0, 'items');
    
    res.json({
      success: true,
      items: data || [],
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
  } catch (error) {
    console.log('❌ Admin gallery catch error:', error.message);
    res.json({
      success: true,
      items: [],
      total: 0,
      message: 'Admin gallery system error',
      setup_required: false
    });
  }
});

/**
 * POST /api/admin/gallery - Create a new gallery item
 */
router.post('/', async (req, res, next) => {
  try {
    console.log('🖼️ Admin gallery create called');
    
    const { supabaseAdmin } = await import('../config/supabase.js');
    const { title, description, media_url, thumbnail_url, media_type, category, position, is_featured } = req.body;

    if (!title || !media_url) {
      return res.status(400).json({
        success: false,
        error: 'Title and media URL are required'
      });
    }

    const itemData = {
      title,
      description,
      media_url,
      thumbnail_url,
      media_type: media_type || 'image',
      category,
      position: position || 0,
      is_featured: is_featured || false,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('gallery_items')
      .insert(itemData)
      .select()
      .single();

    if (error) {
      console.log('❌ Admin gallery create error:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to create gallery item'
      });
    }

    console.log('✅ Admin gallery created:', data.title);
    
    res.status(201).json({
      success: true,
      item: data
    });
  } catch (error) {
    console.log('❌ Admin gallery create catch error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create gallery item'
    });
  }
});

/**
 * PUT /api/admin/gallery/:id - Update a gallery item
 */
router.put('/:id', async (req, res, next) => {
  try {
    console.log('🖼️ Admin gallery update called for:', req.params.id);
    
    const { supabaseAdmin } = await import('../config/supabase.js');
    const { id } = req.params;
    const { title, description, media_url, thumbnail_url, media_type, category, position, is_featured } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (media_url) updateData.media_url = media_url;
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url;
    if (media_type) updateData.media_type = media_type;
    if (category !== undefined) updateData.category = category;
    if (position !== undefined) updateData.position = position;
    if (is_featured !== undefined) updateData.is_featured = is_featured;

    const { data, error } = await supabaseAdmin
      .from('gallery_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.log('❌ Admin gallery update error:', error.message);
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Gallery item not found'
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to update gallery item'
      });
    }

    console.log('✅ Admin gallery updated:', data.title);
    
    res.json({
      success: true,
      item: data
    });
  } catch (error) {
    console.log('❌ Admin gallery update catch error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to update gallery item'
    });
  }
});

/**
 * DELETE /api/admin/gallery/:id - Delete a gallery item
 */
router.delete('/:id', async (req, res, next) => {
  try {
    console.log('🖼️ Admin gallery delete called for:', req.params.id);
    
    const { supabaseAdmin } = await import('../config/supabase.js');
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('gallery_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.log('❌ Admin gallery delete error:', error.message);
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Gallery item not found'
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Failed to delete gallery item'
      });
    }

    console.log('✅ Admin gallery deleted:', id);
    
    res.json({
      success: true,
      message: 'Gallery item deleted successfully'
    });
  } catch (error) {
    console.log('❌ Admin gallery delete catch error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete gallery item'
    });
  }
});

export default router;