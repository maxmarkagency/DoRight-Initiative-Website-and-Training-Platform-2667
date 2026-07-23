import React, { useState, useEffect } from 'react';
import {Link} from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import { SiTiktok } from 'react-icons/si';
import * as FiIcons from 'react-icons/fi';
import supabase from '../lib/supabase';

const {FiFacebook,FiTwitter,FiInstagram,FiLinkedin,FiMail,FiMapPin}=FiIcons;

const Footer=()=> {
  const [siteSettings, setSiteSettings] = useState({});

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['contact_email', 'contact_address', 'social_links'])
      .then(({ data, error }) => {
        if (error) {
          console.error('Error loading footer settings:', error);
          return;
        }
        const settings = {};
        (data || []).forEach((row) => { settings[row.setting_key] = row.setting_value; });
        setSiteSettings(settings);
      });
  }, []);

  const socialLinks = siteSettings.social_links || {};

  return (
    <footer className="bg-black text-white w-full overflow-hidden">
      <div className="w-full max-w-container mx-auto px-4 sm:px-5 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="mb-4">
              <img
                src="/doing_right_logo.png"
                alt="Doing Right Awareness Initiative"
                className="h-12 sm:h-14 w-auto mb-2"
              />
              <div className="text-lg sm:text-xl font-heading font-bold text-white">
                Doing Right Awareness Initiative
              </div>
            </div>
            <p className="text-neutral-300 mb-6 max-w-md text-sm sm:text-base">
              Promoting integrity and civic responsibility across Nigeria through community-led action,education,and accountability initiatives.
            </p>
            <div className="flex space-x-4">
              <a
                href={socialLinks.facebook || '#'}
                className="text-neutral-300 hover:text-accent transition-colors"
                aria-label="Facebook"
              >
                <SafeIcon icon={FiFacebook} className="w-5 h-5" />
              </a>
              <a
                href={socialLinks.twitter || '#'}
                className="text-neutral-300 hover:text-accent transition-colors"
                aria-label="Twitter"
              >
                <SafeIcon icon={FiTwitter} className="w-5 h-5" />
              </a>
              <a
                href={socialLinks.instagram || '#'}
                className="text-neutral-300 hover:text-accent transition-colors"
                aria-label="Instagram"
              >
                <SafeIcon icon={FiInstagram} className="w-5 h-5" />
              </a>
              <a
                href={socialLinks.linkedin || '#'}
                className="text-neutral-300 hover:text-accent transition-colors"
                aria-label="LinkedIn"
              >
                <SafeIcon icon={FiLinkedin} className="w-5 h-5" />
              </a>
              <a
                href={socialLinks.tiktok || '#'}
                className="text-neutral-300 hover:text-accent transition-colors"
                aria-label="TikTok"
              >
                <SafeIcon icon={SiTiktok} className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="min-w-0">
            <h4 className="font-semibold text-white mb-4 text-sm sm:text-base">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-neutral-300 hover:text-accent transition-colors text-sm sm:text-base break-words"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/programs"
                  className="text-neutral-300 hover:text-accent transition-colors text-sm sm:text-base break-words"
                >
                  Our Programs
                </Link>
              </li>
              <li>
                <Link
                  to="/training"
                  className="text-neutral-300 hover:text-accent transition-colors text-sm sm:text-base break-words"
                >
                  Training
                </Link>
              </li>
              <li>
                <Link
                  to="/webinars"
                  className="text-neutral-300 hover:text-accent transition-colors text-sm sm:text-base break-words"
                >
                  Webinars
                </Link>
              </li>
              <li>
                <Link
                  to="/gallery"
                  className="text-neutral-300 hover:text-accent transition-colors text-sm sm:text-base break-words"
                >
                  Gallery
                </Link>
              </li>
              <li>
                <Link
                  to="/trustees"
                  className="text-neutral-300 hover:text-accent transition-colors text-sm sm:text-base break-words"
                >
                  Our Trustees
                </Link>
              </li>
              <li>
                <Link
                  to="/join"
                  className="text-neutral-300 hover:text-accent transition-colors text-sm sm:text-base break-words"
                >
                  Get Involved
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="min-w-0">
            <h4 className="font-semibold text-white mb-4 text-sm sm:text-base">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <SafeIcon icon={FiMail} className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="text-neutral-300 text-sm sm:text-base break-all">{siteSettings.contact_email || 'info@doingright.ng'}</span>
              </div>
              <div className="flex items-start space-x-3">
                <SafeIcon icon={FiMapPin} className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-neutral-300 text-sm sm:text-base break-words">{siteSettings.contact_address || '28b, Olaminuyun street, Parkview, Lagos, Nigeria 101233'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-neutral-700 mt-6 sm:mt-8 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="text-center sm:text-left">
            <p className="text-neutral-400 text-xs sm:text-sm mb-1">
              © {new Date().getFullYear()} Doing Right Awareness Initiative. All rights reserved.
            </p>
            <p className="text-neutral-400 text-xs sm:text-sm">
              Created by{' '}
              <a
                href="https://maxmarkagency.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-white transition-colors"
              >
                Maxmark Agency
              </a>
            </p>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6">
            <Link
              to="/privacy"
              className="text-neutral-400 hover:text-accent text-xs sm:text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-neutral-400 hover:text-accent text-xs sm:text-sm transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/sitemap"
              className="text-neutral-400 hover:text-accent text-xs sm:text-sm transition-colors"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;