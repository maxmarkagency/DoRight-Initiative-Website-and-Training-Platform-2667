import React from 'react';
import { useAuth } from '../../context/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { Link } from 'react-router-dom';

const { FiSearch, FiBell, FiChevronDown, FiHome } = FiIcons;

const StudentHeader = () => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.first_name || user?.email.split('@')[0];
  const initials = displayName ? displayName.charAt(0).toUpperCase() : 'U';

  return (
    <header className="h-16 sm:h-18 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-3 sm:px-4 lg:px-6 xl:px-8 flex-shrink-0">
      <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
        <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg">
          <SafeIcon icon={FiSearch} className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search courses, lessons..."
            className="bg-gray-700 border border-gray-600 rounded-lg pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 w-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-400"
          />
        </div>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6 flex-shrink-0">
        <Link to="/" className="text-gray-400 hover:text-white flex items-center space-x-1 sm:space-x-2 p-1 sm:p-0">
          <SafeIcon icon={FiHome} className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline text-sm sm:text-base">Home</span>
        </Link>
        <button className="text-gray-400 hover:text-white relative p-1">
          <SafeIcon icon={FiBell} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
        </button>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold">
            {initials}
          </div>
          <div className="hidden lg:block">
            <div className="font-semibold text-sm text-white">{displayName}</div>
            <div className="text-xs text-gray-400">{user?.role || 'Student'}</div>
          </div>
          <SafeIcon icon={FiChevronDown} className="text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
    </header>
  );
};

export default StudentHeader;