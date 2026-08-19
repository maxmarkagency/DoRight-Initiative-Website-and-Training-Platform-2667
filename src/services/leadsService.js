import supabase from '../lib/supabase';

export const TIERS = {
  tier_1: {
    key: 'tier_1',
    label: 'Tier 1',
    name: 'Tier 1 (Personal Advocate)',
    description: 'Lead by personal example within your daily routine and share monthly impact stories.',
    focus: 'Lead by personal example within your daily routine.',
    action: 'Share at least 1 personal impact story per month.',
    progression: '12 months of consistent tracking unlocks advancement to Tier 2.',
    badgeClass: 'bg-blue-100 text-blue-800 border border-blue-200',
    color: '#005BBB',
  },
  tier_2: {
    key: 'tier_2',
    label: 'Tier 2',
    name: 'Tier 2 (Movement Champion)',
    description: 'Public outreach, social media campaigns, and community events.',
    focus: 'Public outreach, social media campaigns, and community events.',
    action: 'Share 2 monthly campaign posts & attend 1 quarterly community event.',
    progression: '12 months of proven impact unlocks advancement to Tier 3.',
    badgeClass: 'bg-purple-100 text-purple-800 border border-purple-200',
    color: '#6B46C1',
  },
  tier_3: {
    key: 'tier_3',
    label: 'Tier 3',
    name: 'Tier 3 (Strategic Leader)',
    description: 'Driving organizational strategy and operations across specialized sub-committees.',
    focus: 'Driving organizational strategy and operations across specialized sub-committees.',
    action: 'Maintain 70% committee meeting attendance and deliver assigned monthly tasks in your sub-committees.',
    progression: 'Core leadership driving nationwide transformation.',
    badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    color: '#047857',
  }
};

export const TIER_KEYS = ['tier_1', 'tier_2', 'tier_3'];

export const getActiveSubCommittees = async () => {
  try {
    const { data, error } = await supabase
      .from('sub_committees')
      .select('id, name')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading sub-committees:', error);
    return [];
  }
};

export const getSubCommitteeDetails = async () => {
  try {
    const { data, error } = await supabase
      .from('sub_committees')
      .select('id, name, description')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading sub-committee details:', error);
    return [];
  }
};

const buildAdminNotes = (interest, message) => {
  const lines = [];
  if (interest) lines.push(`Interest: ${interest}`);
  if (message) lines.push(`Message: ${message}`);
  return lines.length > 0 ? lines.join('\n') : null;
};

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export const submitLead = async ({ fullName, email, phone, interest, message, subCommitteeId = null, photoFile }) => {
  let photoPreview = null;
  let photoBase64 = null;
  let photoExt = 'jpg';
  let photoMime = 'image/jpeg';

  if (photoFile) {
    try {
      photoPreview = URL.createObjectURL(photoFile);
    } catch (e) {
      console.warn('Could not generate object URL for preview', e);
    }

    try {
      photoBase64 = await fileToBase64(photoFile);
      photoExt = photoFile.name ? photoFile.name.split('.').pop() : 'jpg';
      photoMime = photoFile.type || 'image/jpeg';
    } catch (e) {
      console.warn('Could not encode photo to base64', e);
    }
  }

  const now = new Date().toISOString();
  const fallbackMembershipId = `DRAI-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // 1. Primary path: Use submit-lead Edge Function (service role bypasses RLS and saves photo)
  try {
    const { data: funcData, error: funcError } = await supabase.functions.invoke('submit-lead', {
      body: {
        fullName,
        email,
        phone: phone || null,
        interest: interest || null,
        message: message || null,
        subCommitteeId: subCommitteeId || null,
        photoBase64,
        photoExt,
        photoMime
      }
    });

    if (!funcError && funcData?.lead) {
      return {
        ...funcData.lead,
        photo_preview: photoPreview || funcData.lead.photo_public_url || null
      };
    }
    if (funcError) {
      console.warn('submit-lead function returned error, using resilient fallback:', funcError);
    }
  } catch (funcErr) {
    console.warn('submit-lead function invocation error, using resilient fallback:', funcErr);
  }

  // 2. Resilient fallback path: Direct insert without .select() (prevents 401 unauthenticated select crash)
  const localLead = {
    full_name: fullName,
    email,
    phone: phone || null,
    sub_committee_id: subCommitteeId || null,
    source: 'website',
    tier: 'tier_1',
    tier_1_at: now,
    membership_id: fallbackMembershipId,
    status: 'new',
    admin_notes: buildAdminNotes(interest, message),
    created_at: now
  };

  const { error: insertError } = await supabase
    .from('leads')
    .insert(localLead);

  if (insertError) {
    const { error: retryError } = await supabase
      .from('leads')
      .insert({
        full_name: fullName,
        email,
        phone: phone || null,
        sub_committee_id: subCommitteeId || null,
        source: 'website',
        tier: 'tier_1',
        tier_1_at: now,
        status: 'new',
        admin_notes: buildAdminNotes(interest, message)
      });

    if (retryError) throw retryError;
  }

  // Trigger welcome email asynchronously
  try {
    supabase.functions.invoke('send-lead-welcome-email', {
      body: {
        type: 'INSERT',
        table: 'leads',
        record: localLead
      }
    }).catch((err) => console.warn('Welcome email trigger warning:', err));
  } catch (e) {
    // Non-blocking
  }

  return {
    ...localLead,
    photo_preview: photoPreview
  };
};

export const DEFAULT_TIER_WHATSAPP_LINKS = {
  tier_1: 'https://chat.whatsapp.com/CuwrXFIM8Ry2DZUImaHIxn?s=cl&p=i&ilr=4&amv=1',
  tier_2: 'https://chat.whatsapp.com/DoRightTier2Champions',
  tier_3: 'https://chat.whatsapp.com/DoRightTier3Leaders'
};

export const getTierWhatsAppLinks = async () => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'tier_whatsapp_links')
      .maybeSingle();

    if (error) throw error;
    return {
      ...DEFAULT_TIER_WHATSAPP_LINKS,
      ...(data?.setting_value || {})
    };
  } catch (err) {
    console.error('Error fetching tier WhatsApp links:', err);
    return DEFAULT_TIER_WHATSAPP_LINKS;
  }
};

export const saveTierWhatsAppLinks = async (links) => {
  const merged = {
    ...DEFAULT_TIER_WHATSAPP_LINKS,
    ...links
  };

  const { error } = await supabase
    .from('site_settings')
    .upsert({
      setting_key: 'tier_whatsapp_links',
      setting_value: merged,
      setting_type: 'json',
      description: 'WhatsApp community group links for each member tier',
      updated_at: new Date().toISOString()
    }, { onConflict: 'setting_key' });

  if (error) throw error;
  return merged;
};

/**
 * Sends a tier promotion/transition notification email to a member.
 */
export const sendTierNotificationEmail = async ({ lead, toTier, fromTier = null, customNotes = null }) => {
  try {
    const whatsappLinks = await getTierWhatsAppLinks();
    const whatsappGroupUrl = whatsappLinks[toTier] || whatsappLinks.tier_1;

    const { data, error } = await supabase.functions.invoke('send-lead-welcome-email', {
      body: {
        action: 'TIER_TRANSITION',
        toTier,
        fromTier,
        customNotes,
        whatsappGroupUrl,
        lead: {
          id: lead.id,
          membership_id: lead.membership_id,
          full_name: lead.full_name,
          email: lead.email,
          tier: toTier
        }
      }
    });

    if (error) {
      console.warn('Tier notification email invocation returned error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Error dispatching tier notification email:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Updates a member's tier and optionally dispatches an automated notification email.
 */
export const updateLeadTier = async ({
  lead,
  newTier,
  adminNotes = '',
  sendEmail = true,
  customEmailNotes = ''
}) => {
  if (!lead || !newTier) throw new Error('Lead and newTier are required');

  const now = new Date().toISOString();
  const updates = {
    tier: newTier,
    admin_notes: adminNotes.trim() ? adminNotes.trim() : null
  };

  // Stamp tier milestone timestamps
  if (newTier === 'tier_1' && !lead.tier_1_at) {
    updates.tier_1_at = now;
  } else if (newTier === 'tier_2' && !lead.tier_2_at) {
    updates.tier_2_at = now;
  } else if (newTier === 'tier_3' && !lead.tier_3_at) {
    updates.tier_3_at = now;
  }

  const { error: dbError } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', lead.id);

  if (dbError) throw dbError;

  let emailResult = null;
  if (sendEmail && lead.email) {
    emailResult = await sendTierNotificationEmail({
      lead,
      toTier: newTier,
      fromTier: lead.tier || 'tier_1',
      customNotes: customEmailNotes
    });
  }

  return { success: true, emailResult };
};

/**
 * Deletes / removes a member lead from the database and cleans up their uploaded photo if present.
 */
export const deleteLead = async (leadId) => {
  if (!leadId) throw new Error('Lead ID is required for deletion');

  // Attempt to clean up lead photo from storage
  try {
    const { data: lead } = await supabase
      .from('leads')
      .select('photo_url')
      .eq('id', leadId)
      .maybeSingle();

    if (lead?.photo_url) {
      await supabase.storage.from('lead-photos').remove([lead.photo_url]);
    }
  } catch (err) {
    console.warn('Could not clean up lead photo on deletion:', err);
  }

  const { data, error } = await supabase
    .from('leads')
    .delete()
    .eq('id', leadId)
    .select();

  if (error) throw error;
  return { success: true, id: leadId, data };
};
