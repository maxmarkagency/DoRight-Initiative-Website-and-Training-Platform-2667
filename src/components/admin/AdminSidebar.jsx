import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const { FiGrid, FiUsers, FiBookOpen, FiMessageSquare, FiImage, FiSettings, FiLogOut, FiChevronsLeft, FiChevronsRight, FiExternalLink, FiBarChart2 } = FiIcons;

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  const navLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: FiGrid },
    { name: 'Users', path: '/admin/users', icon: FiUsers },
    { name: 'Courses', path: '/admin/courses', icon: FiBookOpen },
    { name: 'Analytics', path: '/admin/analytics', icon: FiBarChart2 },
    { name: 'Blog', path: '/admin/blog', icon: FiMessageSquare },
    { name: 'Gallery', path: '/admin/gallery', icon: FiImage },
  ];

  const bottomLinks = [
    { name: 'Settings', path: '/admin/settings', icon: FiSettings },
  ];

  return (
    <div className={`flex flex-col bg-gray-800 text-white transition-width duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 h-20 border-b border-gray-700">
        <Link to="/" className={`font-bold text-2xl text-yellow-400 ${isCollapsed ? 'hidden' : 'block'}`}>
          DoRight
        </Link>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-md hover:bg-gray-700">
          <SafeIcon icon={isCollapsed ? FiChevronsRight : FiChevronsLeft} />
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            end
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition-colors duration-200 ${
                isActive ? 'bg-yellow-400 text-black' : 'hover:bg-gray-700'
              } ${isCollapsed ? 'justify-center' : ''}`
            }
          >
            <SafeIcon icon={link.icon} className="h-5 w-5" />
            <span className={`ml-4 font-medium ${isCollapsed ? 'hidden' : 'block'}`}>{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-2 py-4 border-t border-gray-700 space-y-2">
        {bottomLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition-colors duration-200 ${
                isActive ? 'bg-yellow-400 text-black' : 'hover:bg-gray-700'
              } ${isCollapsed ? 'justify-center' : ''}`
            }
          >
            <SafeIcon icon={link.icon} className="h-5 w-5" />
            <span className={`ml-4 font-medium ${isCollapsed ? 'hidden' : 'block'}`}>{link.name}</span>
          </NavLink>
        ))}
         <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center p-3 rounded-lg transition-colors duration-200 hover:bg-gray-700 ${isCollapsed ? 'justify-center' : ''}`}
        >
          <SafeIcon icon={FiExternalLink} className="h-5 w-5" />
          <span className={`ml-4 font-medium ${isCollapsed ? 'hidden' : 'block'}`}>View Site</span>
        </a>
        <button
          onClick={handleLogout}
          className={`flex items-center w-full p-3 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-colors duration-200 ${isCollapsed ? 'justify-center' : ''}`}
        >
          <SafeIcon icon={FiLogOut} className="h-5 w-5" />
          <span className={`ml-4 font-medium ${isCollapsed ? 'hidden' : 'block'}`}>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;