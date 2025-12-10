import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiGrid, FiSettings, FiLogOut, FiChevronDown } = FiIcons;

const UserMenu = ({ isMobile = false, closeMenu }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleMenuItemClick = () => {
    setIsOpen(false);
    if (closeMenu) closeMenu();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  };

  const getInitials = (email) => {
    if (!email) return 'U';
    const emailPrefix = email.split('@')[0];
    return emailPrefix.substring(0, 2).toUpperCase();
  };

  // Mobile version
  if (isMobile) {
    return (
      <div className="space-y-2">
        <div className="px-4 py-2 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-accent text-primary rounded-full flex items-center justify-center font-bold text-sm">
              {user ? getInitials(user.email) : <SafeIcon icon={FiUser} className="w-4 h-4" />}
            </div>
            <div>
              <p className="text-sm text-gray-400">Signed in as</p>
              <p className="font-medium text-white truncate">{user?.email}</p>
            </div>
          </div>
        </div>
        <Link
          to="/dashboard"
          className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-accent rounded-md transition-colors duration-200"
          onClick={handleMenuItemClick}
        >
          <SafeIcon icon={FiGrid} className="mr-3" />
          <span>Dashboard</span>
        </Link>
        <Link
          to="/dashboard/courses"
          className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-accent rounded-md transition-colors duration-200"
          onClick={handleMenuItemClick}
        >
          <SafeIcon icon={FiUser} className="mr-3" />
          <span>My Courses</span>
        </Link>
        <Link
          to="/dashboard/profile"
          className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-accent rounded-md transition-colors duration-200"
          onClick={handleMenuItemClick}
        >
          <SafeIcon icon={FiUser} className="mr-3" />
          <span>Profile Settings</span>
        </Link>
        <Link
          to="/dashboard/settings"
          className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-accent rounded-md transition-colors duration-200"
          onClick={handleMenuItemClick}
        >
          <SafeIcon icon={FiSettings} className="mr-3" />
          <span>Settings</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-md transition-colors duration-200"
        >
          <SafeIcon icon={FiLogOut} className="mr-3" />
          <span>Logout</span>
        </button>
      </div>
    );
  }

  // Desktop version
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-white hover:text-accent transition-colors duration-300 p-1 rounded-full hover:bg-white/10"
      >
        <div className="w-10 h-10 bg-accent text-primary rounded-full flex items-center justify-center font-bold text-lg">
          {user ? getInitials(user.email) : <SafeIcon icon={FiUser} />}
        </div>
        <SafeIcon icon={FiChevronDown} className={`ml-1 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-20"
          >
            <div className="p-2">
              <div className="px-3 py-2">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-accent text-primary rounded-full flex items-center justify-center font-bold text-lg">
                    {user ? getInitials(user.email) : <SafeIcon icon={FiUser} />}
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Signed in as</p>
                    <p className="font-medium text-white truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
              <hr className="border-gray-700" />
              <Link
                to="/dashboard"
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-accent rounded-md transition-colors duration-200"
                onClick={handleMenuItemClick}
              >
                <SafeIcon icon={FiGrid} className="mr-3" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/dashboard/courses"
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-accent rounded-md transition-colors duration-200"
                onClick={handleMenuItemClick}
              >
                <SafeIcon icon={FiUser} className="mr-3" />
                <span>My Courses</span>
              </Link>
              <Link
                to="/dashboard/profile"
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-accent rounded-md transition-colors duration-200"
                onClick={handleMenuItemClick}
              >
                <SafeIcon icon={FiUser} className="mr-3" />
                <span>Profile Settings</span>
              </Link>
              <Link
                to="/dashboard/settings"
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-accent rounded-md transition-colors duration-200"
                onClick={handleMenuItemClick}
              >
                <SafeIcon icon={FiSettings} className="mr-3" />
                <span>Settings</span>
              </Link>
              <hr className="border-gray-700 my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-md transition-colors duration-200"
              >
                <SafeIcon icon={FiLogOut} className="mr-3" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;