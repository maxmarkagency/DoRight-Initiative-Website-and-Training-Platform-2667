import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { mockStats, mockRecentActivity } from '../../data/adminMockData';

const { FiUsers, FiBookOpen, FiCheckSquare, FiDollarSign, FiBarChart2 } = FiIcons;

const StatCard = ({ icon, title, value, color, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-neutral-200"
  >
    <div className="flex items-center justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-medium text-neutral-500 truncate">{title}</p>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-800">{value}</p>
      </div>
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${color.bg} ml-3 sm:ml-4 flex-shrink-0`}>
        <SafeIcon icon={icon} className={`w-5 h-5 sm:w-6 sm:h-6 ${color.text}`} />
      </div>
    </div>
  </motion.div>
);

const DashboardOverview = () => {
  const stats = [
    { icon: FiUsers, title: 'Total Users', value: mockStats.totalUsers.toLocaleString(), color: { bg: 'bg-primary/10', text: 'text-neutral-800' } },
    { icon: FiBookOpen, title: 'Active Courses', value: mockStats.activeCourses, color: { bg: 'bg-green-100', text: 'text-green-800' } },
    { icon: FiCheckSquare, title: 'Completed Enrollments', value: mockStats.completedEnrollments.toLocaleString(), color: { bg: 'bg-accent/20', text: 'text-neutral-800' } },
    { icon: FiDollarSign, title: 'Total Revenue', value: '₦' + mockStats.siteRevenue, color: { bg: 'bg-primary/10', text: 'text-neutral-800' } },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-4 sm:mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} index={index} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* User Signups Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-neutral-200"
        >
          <h2 className="text-base sm:text-lg font-semibold text-neutral-800 mb-3 sm:mb-4">User Signups</h2>
          <div className="h-48 sm:h-56 lg:h-64 bg-neutral-100 rounded-md flex items-center justify-center">
            <div className="text-center">
              <SafeIcon icon={FiBarChart2} className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-neutral-300 mx-auto" />
              <p className="mt-2 text-xs sm:text-sm text-neutral-400">Chart placeholder</p>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-neutral-200"
        >
          <h2 className="text-base sm:text-lg font-semibold text-neutral-800 mb-3 sm:mb-4">Recent Activity</h2>
          <ul className="space-y-3 sm:space-y-4">
            {mockRecentActivity.map(activity => (
              <li key={activity.id} className="flex items-start">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-neutral-100 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                  <SafeIcon icon={FiUsers} className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-neutral-700">
                    <span className="font-semibold">{activity.user}</span> {activity.action}.
                  </p>
                  <p className="text-xs text-neutral-400">{activity.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardOverview;