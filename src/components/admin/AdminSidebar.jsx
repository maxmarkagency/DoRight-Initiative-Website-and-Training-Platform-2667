import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const { FiGrid, FiUsers, FiBookOpen, FiSettings, FiGlobe, FiLogOut } = FiIcons;

const AdminSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const navLinks = [
    { to: '/admin', icon: FiGrid, label: 'Dashboard' },
    { to: '/admin/users', icon: FiUsers, label: 'Users' },
    { to: '/admin/courses', icon: FiBookOpen, label: 'Courses' },
    { to: '/admin/settings', icon: FiSettings, label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-neutral-200 flex-shrink-0 hidden lg:flex flex-col">
      <div className="h-18 flex items-center px-6 border-b border-neutral-200">
        <Link to="/admin" className="flex items-center">
          <img src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759755907515-drai.png" alt="DRAI Logo" className="h-8 w-auto" />
          <span className="ml-3 font-bold text-lg text-neutral-800">Admin</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin'}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg font-medium transition-colors text-sm ${
                isActive ? 'bg-primary text-white shadow-md' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`
            }
          >
            <SafeIcon icon={link.icon} className="w-5 h-5 mr-3" />
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-6 border-t border-neutral-200 space-y-2">
        <Link
          to="/"
          className="flex items-center px-4 py-3 rounded-lg font-medium text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
        >
          <SafeIcon icon={FiGlobe} className="w-5 h-5 mr-3" />
          View Main Site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 rounded-lg font-medium text-sm text-red-600 hover:bg-red-50"
        >
          <SafeIcon icon={FiLogOut} className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;