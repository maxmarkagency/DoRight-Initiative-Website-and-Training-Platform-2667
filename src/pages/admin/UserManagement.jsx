import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { mockUsers } from '../../data/adminMockData';

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
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-neutral-800">User Management</h1>
        <button 
          onClick={() => alert('This feature is not yet implemented.')}
          className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors flex items-center"
        >
          <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" /> Add User
        </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-full max-w-sm">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="bg-neutral-50 border border-neutral-200 rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-neutral-300 rounded-lg text-neutral-600 hover:bg-neutral-100">
            <SafeIcon icon={FiFilter} className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
        <div className="overflow-x-auto">
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
              {mockUsers.map(user => (
                <tr key={user.id} className="hover:bg-neutral-50">
                  <td className="p-4 font-medium text-neutral-800">{user.name}</td>
                  <td className="p-4 text-neutral-600">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full font-medium text-xs ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`flex items-center text-xs font-medium ${user.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                      <span className={`w-2 h-2 rounded-full mr-2 ${user.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-neutral-600">{user.joined}</td>
                  <td className="p-4 text-right">
                    <button className="text-neutral-500 hover:text-neutral-800 p-2 rounded-full hover:bg-neutral-100">
                      <SafeIcon icon={FiMoreVertical} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default UserManagement;