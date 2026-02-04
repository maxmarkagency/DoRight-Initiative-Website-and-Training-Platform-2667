import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMenu, FiX, FiChevronDown, FiLogIn, FiArrowRight } = FiIcons;

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, loading } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { name: 'Home', path: '/' },
    {
      name: 'About Us',
      dropdown: [
        { name: 'Our Story', path: '/about' },
        { name: 'Our Trustees', path: '/trustees' },
      ]
    },
    {
      name: 'Programs',
      dropdown: [
        { name: 'Our Programs', path: '/programs' },
        { name: 'Training', path: '/training' },
        { name: 'Webinars', path: '/webinars' },
        { name: 'Events', path: '/events' },
      ]
    },
    { name: 'Blog', path: '/blog' },
    {
      name: 'Media',
      dropdown: [
        { name: 'Gallery', path: '/gallery' },
        { name: 'Podcast', path: '/media/podcast' },
      ]
    },
    { name: 'Contact', path: '/contact' },
  ];

  const NavLink = ({ to, children, isDropdown, onClick }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`block px-4 py-2 text-sm rounded-md transition-colors duration-200 ${isDropdown
          ? `text-gray-300 hover:bg-gray-700 hover:text-yellow-400`
          : `font-medium ${isActive ? 'text-yellow-400' : 'text-white hover:text-yellow-400'}`
          }`}
      >
        {children}
      </Link>
    );
  };

  const DropdownMenu = ({ item }) => {
    const [isSubDropdownOpen, setSubDropdownOpen] = useState(false);
    const timeoutRef = useRef(null);

    const handleMouseEnter = () => {
      clearTimeout(timeoutRef.current);
      setSubDropdownOpen(true);
    };

    const handleMouseLeave = () => {
      timeoutRef.current = setTimeout(() => {
        setSubDropdownOpen(false);
      }, 200);
    };

    const isParentActive = item.dropdown.some(d => d.path === location.pathname);

    return (
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          className={`font-medium flex items-center transition-colors duration-200 ${isParentActive ? 'text-yellow-400' : 'text-white hover:text-yellow-400'
            }`}
        >
          {item.name}
          <SafeIcon icon={FiChevronDown} className={`ml-1 h-4 w-4 transition-transform duration-200 ${isSubDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {isSubDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-20 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1"
            >
              {item.dropdown.map((subLink) => (
                <NavLink key={subLink.name} to={subLink.path} isDropdown>
                  {subLink.name}
                </NavLink>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <header className="bg-black bg-opacity-80 backdrop-blur-md text-white fixed w-full z-50 shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img
                src="/doing_right_logo.png"
                alt="DoRight Logo"
                className="h-10 sm:h-12 w-auto"
              />
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-6 lg:space-x-8">
            {navLinks.map((item) => (
              item.dropdown ? (
                <DropdownMenu key={item.name} item={item} />
              ) : (
                <NavLink key={item.name} to={item.path}>
                  {item.name}
                </NavLink>
              )
            ))}
          </div>

          <div className="flex items-center">
            <div className="hidden md:flex items-center space-x-2 sm:space-x-4">
              <Link to="/join" className="group flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-yellow-400 text-xs sm:text-sm font-medium rounded-md text-yellow-400 hover:bg-yellow-400 hover:text-black transition-colors">
                Join Us
                <SafeIcon icon={FiArrowRight} className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              {loading ? (
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-700 rounded-full animate-pulse"></div>
              ) : user ? (
                <UserMenu />
              ) : (
                <Link to="/login" className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-black bg-yellow-400 hover:bg-yellow-500 transition-colors">
                  <SafeIcon icon={FiLogIn} className="mr-1 sm:mr-2 -ml-1 h-4 w-4 sm:h-5 sm:w-5" />
                  Login
                </Link>
              )}
            </div>

            <div className="md:hidden ml-2 sm:ml-4">
              <button onClick={toggleMenu} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white touch-manipulation">
                <span className="sr-only">Open main menu</span>
                <SafeIcon icon={isOpen ? FiX : FiMenu} className="block h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-gray-800 max-h-screen overflow-y-auto"
          >
            <div className="px-2 sm:px-3 pt-2 pb-3 space-y-1">
              {navLinks.map((item) => (
                item.dropdown ? (
                  <div key={item.name}>
                    <h3 className="px-3 sm:px-4 py-2 text-sm font-semibold text-gray-400">{item.name}</h3>
                    {item.dropdown.map(subLink => (
                      <NavLink key={subLink.name} to={subLink.path} onClick={toggleMenu} isDropdown>
                        <span className="ml-4 text-sm">{subLink.name}</span>
                      </NavLink>
                    ))}
                  </div>
                ) : (
                  <NavLink key={item.name} to={item.path} onClick={toggleMenu} className="block px-3 sm:px-4 py-2 text-sm rounded-md transition-colors duration-200 font-medium text-white hover:bg-gray-700 hover:text-yellow-400" />
                )
              ))}
              <div className="border-t border-gray-700 pt-3 sm:pt-4 mt-3 sm:mt-4 space-y-2">
                <NavLink to="/join" onClick={toggleMenu} className="block px-3 sm:px-4 py-2 text-sm rounded-md font-medium text-yellow-400 hover:bg-yellow-400 hover:text-black transition-colors">
                  Join Us
                </NavLink>
                {loading ? (
                  <div className="flex items-center px-3 sm:px-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 rounded-full animate-pulse"></div>
                    <div className="ml-2 sm:ml-3 h-3 sm:h-4 bg-gray-700 rounded w-16 sm:w-24 animate-pulse"></div>
                  </div>
                ) : user ? (
                  <UserMenu isMobile={true} closeMenu={toggleMenu} />
                ) : (
                  <NavLink to="/login" onClick={toggleMenu} className="block">
                    <div className="flex items-center px-3 sm:px-4 py-2 text-sm font-medium text-black bg-yellow-400 hover:bg-yellow-500 rounded-md transition-colors">
                      <SafeIcon icon={FiLogIn} className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Login
                    </div>
                  </NavLink>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;