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
    className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-neutral-500">{title}</p>
        <p className="text-3xl font-bold text-neutral-800">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color.bg}`}>
        <SafeIcon icon={icon} className={`w-6 h-6 ${color.text}`} />
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
    <div>
      <h1 className="text-3xl font-bold text-neutral-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} index={index} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Signups Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-neutral-200"
        >
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">User Signups</h2>
          <div className="h-64 bg-neutral-100 rounded-md flex items-center justify-center">
            <SafeIcon icon={FiBarChart2} className="w-12 h-12 text-neutral-300" />
            <p className="ml-4 text-neutral-400">Chart placeholder</p>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200"
        >
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Recent Activity</h2>
          <ul className="space-y-4">
            {mockRecentActivity.map(activity => (
              <li key={activity.id} className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <SafeIcon icon={FiUsers} className="w-4 h-4 text-neutral-500" />
                </div>
                <div>
                  <p className="text-sm text-neutral-700">
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