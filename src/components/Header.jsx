import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMenu, FiX, FiChevronDown, FiUsers, FiBookOpen, FiCalendar, FiFileText, FiCamera, FiUser } = FiIcons;

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();
  const timeoutRef = useRef(null);
  const { isAuthenticated } = useAuth();

  const navigation = [
    { label: 'About', href: '/about', megaMenu: { sections: [{ title: 'Our Story', items: [{ label: 'About Us', href: '/about', description: 'Learn about our mission and values' }, { label: 'Our Trustees', href: '/trustees', description: 'Meet our distinguished board members' }] }, { title: 'What We Do', items: [{ label: 'Our Programs', href: '/programs', description: 'Comprehensive community-led solutions' }] }] } },
    { label: 'Learn', href: '/training', megaMenu: { sections: [{ title: 'Training & Certification', items: [{ label: 'Browse Courses', href: '/training', description: 'Progressive learning path with certificates', icon: FiBookOpen }, { label: 'Training Dashboard', href: '/training/dashboard', description: 'Track your learning progress', icon: FiUsers, requiresAuth: true }] }, { title: 'Live Events', items: [{ label: 'Webinars', href: '/webinars', description: 'Join live sessions and watch recordings', icon: FiCalendar }] }] } },
    { label: 'Resources', href: '/blog', megaMenu: { sections: [{ title: 'Content & Insights', items: [{ label: 'Blog', href: '/blog', description: 'Latest articles and insights', icon: FiFileText }, { label: 'Gallery', href: '/gallery', description: 'Photos from our events and activities', icon: FiCamera }] }] } },
    { label: 'Get Involved', href: '/join' },
    { label: 'Contact', href: '/contact' }
  ];

  const isActive = (path) => location.pathname === path;

  const handleMouseEnter = (index) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveDropdown(index);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-black shadow-lg w-full">
      <div className="w-full max-w-container mx-auto px-4 sm:px-5">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <Link to="/" onClick={handleLinkClick} className="flex items-center flex-shrink-0">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center">
              <img src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759755907515-drai.png" alt="DRAI Logo" className="h-8 w-auto sm:h-10" />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navigation.map((item, index) => (
              <div key={item.href} className="relative" onMouseEnter={() => item.megaMenu && handleMouseEnter(index)} onMouseLeave={handleMouseLeave}>
                <Link to={item.href} onClick={handleLinkClick} className={`flex items-center px-3 xl:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm xl:text-base ${isActive(item.href) ? 'bg-white text-black shadow-md' : 'text-white hover:text-accent hover:bg-white/10'}`}>
                  {item.label}
                  {item.megaMenu && (
                    <motion.div animate={{ rotate: activeDropdown === index ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <SafeIcon icon={FiChevronDown} className="ml-1 w-4 h-4" />
                    </motion.div>
                  )}
                </Link>

                {/* Mega Menu */}
                <AnimatePresence>
                  {item.megaMenu && activeDropdown === index && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-neutral-200 min-w-80 xl:min-w-96 z-50" style={{ maxWidth: 'calc(100vw - 2rem)' }} onMouseEnter={() => handleMouseEnter(index)} onMouseLeave={handleMouseLeave}>
                      <div className="p-4 xl:p-6">
                        <div className="grid grid-cols-1 gap-4 xl:gap-6">
                          {item.megaMenu.sections.map((section, sectionIndex) => (
                            <div key={sectionIndex}>
                              <h3 className="text-xs xl:text-sm font-semibold text-black uppercase tracking-wide mb-3"> {section.title} </h3>
                              <div className="space-y-1">
                                {section.items.map((subItem, subIndex) => {
                                  // Skip items that require auth if user is not authenticated
                                  if (subItem.requiresAuth && !isAuthenticated) {
                                    return null;
                                  }
                                  return (
                                    <Link key={subIndex} to={subItem.href} className="flex items-start p-2 xl:p-3 rounded-lg hover:bg-neutral-50 transition-colors group" onClick={handleLinkClick}>
                                      {subItem.icon && <SafeIcon icon={subItem.icon} className="w-4 xl:w-5 h-4 xl:h-5 text-black mt-0.5 mr-2 xl:mr-3 flex-shrink-0" />}
                                      <div className="min-w-0">
                                        <div className="font-medium text-black group-hover:text-black transition-colors text-sm xl:text-base"> {subItem.label} </div>
                                        {subItem.description && <div className="text-xs xl:text-sm text-neutral-600 mt-1 break-words"> {subItem.description} </div>}
                                      </div>
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Auth Section */}
            <div className="flex items-center ml-4">
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login" className="text-white hover:text-accent px-3 py-2 rounded-lg font-medium transition-colors"> Sign In </Link>
                  <Link to="/login" className="bg-accent text-black px-4 py-2 rounded-lg font-semibold hover:brightness-90 transition-colors"> Get Started </Link>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/join" onClick={handleLinkClick} className="bg-accent text-black px-4 xl:px-6 py-2 rounded-lg font-semibold hover:brightness-90 transition-colors ml-2 xl:ml-4 text-sm xl:text-base shadow-md hover:shadow-lg"> Donate </Link>
            </motion.div>
          </nav>

          {/* Mobile Menu Button */}
          <motion.button whileTap={{ scale: 0.95 }} className="lg:hidden p-2 flex-shrink-0" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            <motion.div animate={{ rotate: isMenuOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <SafeIcon icon={isMenuOpen ? FiX : FiMenu} className="w-6 h-6 text-white" />
            </motion.div>
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="lg:hidden py-4 border-t border-white/20 overflow-hidden">
              <div className="space-y-2 max-w-full">
                {/* Auth Section Mobile */}
                {!isAuthenticated && (
                  <div className="flex space-x-2 mb-4">
                    <Link to="/login" className="flex-1 text-center bg-white/10 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/20 transition-colors" onClick={handleLinkClick}> Sign In </Link>
                    <Link to="/login" className="flex-1 text-center bg-accent text-black px-4 py-2 rounded-lg font-semibold hover:brightness-90 transition-colors" onClick={handleLinkClick}> Get Started </Link>
                  </div>
                )}

                {/* User Info Mobile */}
                {isAuthenticated && (
                  <div className="bg-white/10 rounded-lg p-3 mb-4">
                    <UserMenu />
                  </div>
                )}

                {navigation.map((item) => (
                  <div key={item.href} className="w-full">
                    <Link to={item.href} className={`block px-3 py-2 rounded-lg font-medium transition-colors w-full ${isActive(item.href) ? 'bg-white text-black' : 'text-white hover:text-accent hover:bg-white/10'}`} onClick={handleLinkClick}>
                      {item.label}
                    </Link>
                    {/* Mobile Submenu */}
                    {item.megaMenu && (
                      <div className="ml-4 mt-2 space-y-1 max-w-full">
                        {item.megaMenu.sections.map((section) =>
                          section.items.map((subItem, subIndex) => {
                            // Skip items that require auth if user is not authenticated
                            if (subItem.requiresAuth && !isAuthenticated) {
                              return null;
                            }
                            return (
                              <Link key={subIndex} to={subItem.href} className="block px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors break-words" onClick={handleLinkClick}>
                                {subItem.label}
                              </Link>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Mobile CTA */}
                <Link to="/join" className="block bg-accent text-black px-3 py-2 rounded-lg font-semibold hover:brightness-90 transition-colors text-center mt-4" onClick={handleLinkClick}> Donate </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;