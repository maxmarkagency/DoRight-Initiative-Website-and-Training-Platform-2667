import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSave, FiLoader, FiCheck } = FiIcons;

const Settings = () => {
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }, 1500);
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
              defaultValue="DoRight Academy"
              className="w-full max-w-md border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ))}
          {renderSettingRow("Contact Email", (
            <input
              type="email"
              defaultValue="info@doright.ng"
              className="w-full max-w-md border border-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ))}
          {renderSettingRow("Allow Registration", (
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="relative w-11 h-6 bg-neutral-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          ))}
          {renderSettingRow("Maintenance Mode", (
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
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