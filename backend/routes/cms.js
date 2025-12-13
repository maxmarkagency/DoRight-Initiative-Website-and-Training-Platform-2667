import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authorization token' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || userData?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// ============= CONTENT SECTIONS =============

// Get all sections for a page
router.get('/sections/:pageName', async (req, res) => {
  try {
    const { pageName } = req.params;

    const { data, error } = await supabase
      .from('content_sections')
      .select('*')
      .eq('page_name', pageName)
      .eq('is_visible', true)
      .order('position', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single section by key
router.get('/sections/:pageName/:sectionKey', async (req, res) => {
  try {
    const { pageName, sectionKey } = req.params;

    const { data, error } = await supabase
      .from('content_sections')
      .select('*')
      .eq('page_name', pageName)
      .eq('section_key', sectionKey)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching section:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create or update section (admin only)
router.post('/sections', adminAuth, async (req, res) => {
  try {
    const { page_name, section_key, section_type, position, content_data, is_visible } = req.body;

    const { data, error } = await supabase
      .from('content_sections')
      .upsert({
        page_name,
        section_key,
        section_type,
        position: position || 0,
        content_data: content_data || {},
        is_visible: is_visible !== undefined ? is_visible : true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'page_name,section_key'
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error saving section:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update section visibility (admin only)
router.patch('/sections/:id/visibility', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_visible } = req.body;

    const { data, error } = await supabase
      .from('content_sections')
      .update({ is_visible })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating section visibility:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete section (admin only)
router.delete('/sections/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('content_sections')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= SITE SETTINGS =============

// Get all settings
router.get('/settings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get settings by category
router.get('/settings/category/:category', async (req, res) => {
  try {
    const { category } = req.params;

    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('category', category);

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching settings by category:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update setting (admin only)
router.put('/settings/:key', adminAuth, async (req, res) => {
  try {
    const { key } = req.params;
    const { setting_value, setting_type, category, description } = req.body;

    const { data, error } = await supabase
      .from('site_settings')
      .upsert({
        setting_key: key,
        setting_value,
        setting_type: setting_type || 'text',
        category: category || 'general',
        description,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'setting_key'
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= TEAM MEMBERS =============

// Get all team members
router.get('/team', async (req, res) => {
  try {
    const { category } = req.query;

    let query = supabase
      .from('team_members')
      .select('*')
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('position_order', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single team member
router.get('/team/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching team member:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create team member (admin only)
router.post('/team', adminAuth, async (req, res) => {
  try {
    const teamData = req.body;

    const { data, error } = await supabase
      .from('team_members')
      .insert(teamData)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error creating team member:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update team member (admin only)
router.put('/team/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const teamData = req.body;

    const { data, error } = await supabase
      .from('team_members')
      .update(teamData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete team member (admin only)
router.delete('/team/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= PROGRAMS =============

// Get all programs
router.get('/programs', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('programs_cms')
      .select('*')
      .eq('is_active', true)
      .order('position_order', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single program
router.get('/programs/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const { data, error } = await supabase
      .from('programs_cms')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching program:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create program (admin only)
router.post('/programs', adminAuth, async (req, res) => {
  try {
    const programData = req.body;

    const { data, error } = await supabase
      .from('programs_cms')
      .insert(programData)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error creating program:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update program (admin only)
router.put('/programs/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const programData = req.body;

    const { data, error } = await supabase
      .from('programs_cms')
      .update(programData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating program:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete program (admin only)
router.delete('/programs/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('programs_cms')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting program:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= EVENTS =============

// Get all events
router.get('/events', async (req, res) => {
  try {
    const { upcoming } = req.query;

    let query = supabase
      .from('events_calendar')
      .select('*')
      .eq('is_published', true);

    if (upcoming === 'true') {
      query = query.gte('event_date', new Date().toISOString());
    }

    const { data, error } = await query.order('event_date', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single event
router.get('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('events_calendar')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create event (admin only)
router.post('/events', adminAuth, async (req, res) => {
  try {
    const eventData = req.body;

    const { data, error } = await supabase
      .from('events_calendar')
      .insert(eventData)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update event (admin only)
router.put('/events/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const eventData = req.body;

    const { data, error } = await supabase
      .from('events_calendar')
      .update(eventData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete event (admin only)
router.delete('/events/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('events_calendar')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= NAVIGATION ITEMS =============

// Get navigation items by location
router.get('/navigation/:location', async (req, res) => {
  try {
    const { location } = req.params;

    const { data, error } = await supabase
      .from('navigation_items')
      .select('*')
      .eq('menu_location', location)
      .eq('is_active', true)
      .order('position_order', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching navigation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create navigation item (admin only)
router.post('/navigation', adminAuth, async (req, res) => {
  try {
    const navData = req.body;

    const { data, error } = await supabase
      .from('navigation_items')
      .insert(navData)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error creating navigation item:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update navigation item (admin only)
router.put('/navigation/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const navData = req.body;

    const { data, error } = await supabase
      .from('navigation_items')
      .update(navData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating navigation item:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete navigation item (admin only)
router.delete('/navigation/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('navigation_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting navigation item:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============= PAGE CONTENT =============

// Get all pages (admin only)
router.get('/pages', adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('page_content')
      .select('*')
      .order('page_name', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single page
router.get('/pages/:pageName', async (req, res) => {
  try {
    const { pageName } = req.params;

    const { data, error } = await supabase
      .from('page_content')
      .select('*')
      .eq('page_name', pageName)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create or update page (admin only)
router.post('/pages', adminAuth, async (req, res) => {
  try {
    const pageData = req.body;

    const { data, error } = await supabase
      .from('page_content')
      .upsert(pageData, {
        onConflict: 'page_name'
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error saving page:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
