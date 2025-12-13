import React from 'react';
import { useAuth } from '../../context/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSearch, FiBell, FiChevronDown } = FiIcons;

const AdminHeader = () => {
  const { user, profile } = useAuth();
  const displayName = profile?.first_name || user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Admin';
  const initials = displayName ? displayName.charAt(0).toUpperCase() : 'A';
  const userRole = profile?.role || user?.user_metadata?.role || 'admin';

  return (
    <header className="h-18 bg-white border-b border-neutral-200 flex items-center justify-between px-6 lg:px-8 flex-shrink-0">
      <div className="relative">
        <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-neutral-100 border border-neutral-200 rounded-lg pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="flex items-center space-x-6">
        <button className="text-neutral-500 hover:text-neutral-800 relative">
          <SafeIcon icon={FiBell} className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent text-black rounded-full flex items-center justify-center font-bold">
            {initials}
          </div>
          <div>
            <div className="font-semibold text-sm text-neutral-800">{displayName}</div>
            <div className="text-xs text-neutral-500 capitalize">{userRole}</div>
          </div>
          <SafeIcon icon={FiChevronDown} className="text-neutral-500" />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;