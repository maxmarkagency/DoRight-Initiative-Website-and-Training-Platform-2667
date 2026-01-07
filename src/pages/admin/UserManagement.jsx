import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSearch, FiFilter, FiPlus, FiMoreVertical } = FiIcons;

const UserManagement = () => {
  const getRoleBadge = (role) => {
    const roles = {
      admin: 'bg-primary text-white',
      instructor: 'bg-accent/20 text-neutral-800',
      staff: 'bg-neutral-200 text-neutral-800',
      student: 'bg-green-100 text-green-800',
    };
    return roles[role] || 'bg-neutral-200 text-neutral-800';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 lg:p-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800">User Management</h1>
        <button
          onClick={() => alert('This feature is not yet implemented.')}
          className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center text-sm sm:text-base w-full sm:w-auto"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Add User
        </button>
      </div>
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-neutral-200">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-4 space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative w-full sm:max-w-sm">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              className="bg-neutral-50 border border-neutral-200 rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
          <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-neutral-300 rounded-lg text-neutral-600 hover:bg-neutral-100 text-sm w-full sm:w-auto">
            <SafeIcon icon={FiFilter} className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-full inline-block align-middle">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="w-full text-sm text-left">
                <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Joined Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  <tr className="hover:bg-neutral-50">
                    <td className="p-4 font-medium text-neutral-800">No users found</td>
                    <td className="p-4 text-neutral-600">-</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full font-medium text-xs bg-neutral-200 text-neutral-800">
                        -
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center text-xs font-medium text-neutral-500">
                        <span className="w-2 h-2 rounded-full mr-2 bg-neutral-400"></span>
                        -
                      </span>
                    </td>
                    <td className="p-4 text-neutral-600">-</td>
                    <td className="p-4 text-right">
                      <button className="text-neutral-500 hover:text-neutral-800 p-2 rounded-full hover:bg-neutral-100">
                        <SafeIcon icon={FiMoreVertical} />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-4">
              <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 text-center text-neutral-500">
                No users found
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserManagement;