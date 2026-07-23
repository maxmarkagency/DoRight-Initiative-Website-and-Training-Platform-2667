import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../../lib/supabase';

const { FiSave, FiLoader, FiCheck, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } = FiIcons;

// contact_address, contact_phone, and social_links are also read directly by
// Contact.jsx (src/pages/Contact.jsx) - they must stay in this list or there's
// no admin UI to set them at all, only the hardcoded fallback text ever shows.
const SETTING_KEYS = [
  'site_name', 'contact_email', 'contact_phone', 'contact_address', 'social_links',
  'allow_registration', 'maintenance_mode'
];

const DEFAULT_SOCIAL_LINKS = { facebook: '', twitter: '', instagram: '', linkedin: '' };

const Settings = () => {
  const [values, setValues] = useState({
    site_name: 'DoRight Academy',
    contact_email: 'info@doright.ng',
    contact_phone: '',
    contact_address: '',
    social_links: DEFAULT_SOCIAL_LINKS,
    allow_registration: true,
    maintenance_mode: false
  });
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', SETTING_KEYS);

      if (error) throw error;

      const loaded = {};
      (data || []).forEach((row) => {
        loaded[row.setting_key] = row.setting_key === 'social_links'
          ? { ...DEFAULT_SOCIAL_LINKS, ...row.setting_value }
          : row.setting_value;
      });
      setValues((prev) => ({ ...prev, ...loaded }));
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSocialLink = (platform, url) => {
    setValues((prev) => ({ ...prev, social_links: { ...prev.social_links, [platform]: url } }));
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const rows = SETTING_KEYS.map((key) => ({
        setting_key: key,
        setting_value: values[key],
        setting_type: typeof values[key] === 'boolean' ? 'boolean' : typeof values[key] === 'object' ? 'json' : 'text',
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('site_settings')
        .upsert(rows, { onConflict: 'setting_key' });

      if (error) throw error;

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save: ' + error.message);
      setSaveStatus('idle');
    }
  };

  const getButtonContent = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 mr-2"
            >
              <SafeIcon icon={FiLoader} />
            </motion.div>
            Saving...
          </>
        );
      case 'saved':
        return (
          <>
            <SafeIcon icon={FiCheck} className="w-5 h-5 mr-2" />
            Saved!
          </>
        );
      default:
        return (
          <>
            <SafeIcon icon={FiSave} className="w-5 h-5 mr-2" />
            Save Changes
          </>
        );
    }
  };

  const renderSettingRow = (label, children) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-b border-neutral-200">
      <div className="md:col-span-1">
        <label className="font-medium text-neutral-800">{label}</label>
      </div>
      <div className="md:col-span-2">{children}</div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold text-neutral-800 mb-6">Settings</h1>
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">General Settings</h2>
          <p className="text-sm text-neutral-500">Update your site's general information and settings.</p>
        </div>
        <div className="p-6">
          {renderSettingRow("Site Name", (
            <input
              type="text"
              value={values.site_name}
              onChange={(e) => setValues({ ...values, site_name: e.target.value })}
              className="w-full max-w-md border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ))}
          {renderSettingRow("Contact Email", (
            <input
              type="email"
              value={values.contact_email}
              onChange={(e) => setValues({ ...values, contact_email: e.target.value })}
              className="w-full max-w-md border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ))}
          {renderSettingRow("Contact Phone", (
            <input
              type="tel"
              value={values.contact_phone}
              onChange={(e) => setValues({ ...values, contact_phone: e.target.value })}
              placeholder="+234 (0) 123 456 7890"
              className="w-full max-w-md border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ))}
          {renderSettingRow("Address", (
            <textarea
              value={values.contact_address}
              onChange={(e) => setValues({ ...values, contact_address: e.target.value })}
              rows={3}
              placeholder="DoRight Awareness Initiative&#10;28b, Olaminuyun Street, Parkview&#10;Lagos, Nigeria 101233"
              className="w-full max-w-md border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ))}
          {renderSettingRow("Social Links", (
            <div className="space-y-2 max-w-md">
              {[
                { key: 'facebook', icon: FiFacebook, placeholder: 'https://facebook.com/...' },
                { key: 'twitter', icon: FiTwitter, placeholder: 'https://twitter.com/...' },
                { key: 'instagram', icon: FiInstagram, placeholder: 'https://instagram.com/...' },
                { key: 'linkedin', icon: FiLinkedin, placeholder: 'https://linkedin.com/...' }
              ].map(({ key, icon, placeholder }) => (
                <div key={key} className="flex items-center gap-2">
                  <SafeIcon icon={icon} className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                  <input
                    type="url"
                    value={values.social_links[key]}
                    onChange={(e) => updateSocialLink(key, e.target.value)}
                    placeholder={placeholder}
                    className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              ))}
            </div>
          ))}
          {renderSettingRow("Allow Registration", (
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={values.allow_registration}
                onChange={(e) => setValues({ ...values, allow_registration: e.target.checked })}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-neutral-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          ))}
          {renderSettingRow("Maintenance Mode", (
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={values.maintenance_mode}
                onChange={(e) => setValues({ ...values, maintenance_mode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-neutral-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          ))}
        </div>
        <div className="p-6 bg-neutral-50 rounded-b-lg flex justify-end">
          <button
            onClick={handleSave}
            disabled={saveStatus !== 'idle'}
            className={`
              px-4 py-2 rounded-lg font-semibold transition-colors flex items-center
              ${saveStatus === 'saved' ? 'bg-green-500 text-white' : 'bg-primary text-white hover:bg-primary-600'}
              disabled:opacity-70 disabled:cursor-not-allowed
            `}
          >
            {getButtonContent()}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
