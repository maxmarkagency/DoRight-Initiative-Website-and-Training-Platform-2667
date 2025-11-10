import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const {
  FiTrendingUp,
  FiUsers,
  FiClock,
  FiAward,
  FiBarChart2,
  FiArrowLeft,
  FiDownload,
  FiCalendar,
  FiTarget,
  FiCheckCircle,
  FiActivity,
  FiPieChart,
  FiEye
} = FiIcons;

// Mock analytics data
const courseAnalytics = {
  overview: {
    totalEnrollments: 1520,
    activeStudents: 1245,
    completionRate: 68,
    averageProgress: 72,
    averageRating: 4.7,
    totalReviews: 342,
    averageTimeToComplete: 28,
    certificatesIssued: 1034
  },
  enrollmentTrend: [
    { month: 'Jan', enrollments: 120, completions: 45 },
    { month: 'Feb', enrollments: 150, completions: 68 },
    { month: 'Mar', enrollments: 180, completions: 92 },
    { month: 'Apr', enrollments: 210, completions: 115 },
    { month: 'May', enrollments: 240, completions: 148 },
    { month: 'Jun', enrollments: 280, completions: 182 },
    { month: 'Jul', enrollments: 340, completions: 224 }
  ],
  modulePerformance: [
    { name: 'Module 1: Introduction', completionRate: 95, avgScore: 88, avgTime: 45 },
    { name: 'Module 2: Core Concepts', completionRate: 87, avgScore: 82, avgTime: 65 },
    { name: 'Module 3: Practical Applications', completionRate: 78, avgScore: 79, avgTime: 85 },
    { name: 'Module 4: Case Studies', completionRate: 72, avgScore: 84, avgTime: 95 },
    { name: 'Module 5: Final Assessment', completionRate: 68, avgScore: 86, avgTime: 120 }
  ],
  studentEngagement: {
    dailyActiveUsers: 342,
    weeklyActiveUsers: 856,
    monthlyActiveUsers: 1245,
    avgSessionDuration: 42,
    avgLessonsPerSession: 3.2,
    discussionPosts: 1456,
    questionsAsked: 234
  },
  demographics: {
    ageGroups: [
      { range: '18-24', percentage: 25 },
      { range: '25-34', percentage: 35 },
      { range: '35-44', percentage: 22 },
      { range: '45-54', percentage: 12 },
      { range: '55+', percentage: 6 }
    ],
    locations: [
      { city: 'Lagos', students: 456 },
      { city: 'Abuja', students: 342 },
      { city: 'Port Harcourt', students: 234 },
      { city: 'Kano', students: 198 },
      { city: 'Others', students: 290 }
    ]
  },
  topPerformers: [
    { name: 'John Doe', progress: 100, score: 98, timeSpent: 24 },
    { name: 'Jane Smith', progress: 100, score: 96, timeSpent: 26 },
    { name: 'Michael Brown', progress: 95, score: 94, timeSpent: 22 },
    { name: 'Sarah Chen', progress: 92, score: 93, timeSpent: 28 },
    { name: 'David Lee', progress: 90, score: 91, timeSpent: 25 }
  ]
};

const StatCard = ({ icon, title, value, subtitle, color, trend }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 hover:shadow-md transition-shadow"
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`p-3 rounded-lg ${color}`}>
        <SafeIcon icon={icon} className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <span className={`text-sm font-semibold px-2 py-1 rounded ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-2xl font-bold text-neutral-800 mb-1">{value}</h3>
    <p className="text-sm font-medium text-neutral-600 mb-1">{title}</p>
    {subtitle && <p className="text-xs text-neutral-400">{subtitle}</p>}
  </motion.div>
);

const EnrollmentChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => Math.max(d.enrollments, d.completions)));
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-primary rounded mr-2"></div>
            <span className="text-neutral-600">Enrollments</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span className="text-neutral-600">Completions</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-end justify-between h-64 space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="w-full flex space-x-1 mb-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(item.enrollments / maxValue) * 100}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex-1 bg-primary rounded-t relative group cursor-pointer"
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {item.enrollments} enrolled
                </div>
              </motion.div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(item.completions / maxValue) * 100}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.05 }}
                className="flex-1 bg-green-500 rounded-t relative group cursor-pointer"
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {item.completions} completed
                </div>
              </motion.div>
            </div>
            <span className="text-xs text-neutral-500 mt-2">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProgressBar = ({ percentage, color = 'bg-primary' }) => (
  <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${percentage}%` }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`h-full ${color} rounded-full`}
    />
  </div>
);

const CourseAnalytics = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('7days');
  const { overview, enrollmentTrend, modulePerformance, studentEngagement, demographics, topPerformers } = courseAnalytics;

  const handleExport = () => {
    alert('Export functionality coming soon!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/courses')}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5 text-neutral-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-neutral-800">Course Analytics</h1>
            <p className="text-neutral-600 mt-1">Foundations of Integrity - Detailed Insights</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
            <option value="all">All Time</option>
          </select>
          
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
          >
            <SafeIcon icon={FiDownload} className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FiUsers}
          title="Total Enrollments"
          value={overview.totalEnrollments.toLocaleString()}
          subtitle={`${overview.activeStudents} active students`}
          color="bg-primary"
          trend={12}
        />
        <StatCard
          icon={FiCheckCircle}
          title="Completion Rate"
          value={`${overview.completionRate}%`}
          subtitle={`${overview.certificatesIssued} certificates issued`}
          color="bg-green-500"
          trend={8}
        />
        <StatCard
          icon={FiClock}
          title="Avg. Completion Time"
          value={`${overview.averageTimeToComplete} days`}
          subtitle="Industry avg: 35 days"
          color="bg-accent"
          trend={-5}
        />
        <StatCard
          icon={FiAward}
          title="Average Rating"
          value={overview.averageRating}
          subtitle={`${overview.totalReviews} reviews`}
          color="bg-yellow-500"
          trend={3}
        />
      </div>

      {/* Enrollment Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-neutral-800">Enrollment & Completion Trend</h2>
            <p className="text-sm text-neutral-500 mt-1">Monthly overview of course progress</p>
          </div>
          <SafeIcon icon={FiTrendingUp} className="w-6 h-6 text-primary" />
        </div>
        <EnrollmentChart data={enrollmentTrend} />
      </motion.div>

      {/* Module Performance & Student Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-800">Module Performance</h2>
              <p className="text-sm text-neutral-500 mt-1">Completion rates by module</p>
            </div>
            <SafeIcon icon={FiBarChart2} className="w-6 h-6 text-primary" />
          </div>
          
          <div className="space-y-5">
            {modulePerformance.map((module, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-neutral-700">{module.name}</span>
                  <span className="text-neutral-500">{module.completionRate}%</span>
                </div>
                <ProgressBar percentage={module.completionRate} />
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>Avg Score: {module.avgScore}%</span>
                  <span>Avg Time: {module.avgTime} min</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Student Engagement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-800">Student Engagement</h2>
              <p className="text-sm text-neutral-500 mt-1">Activity metrics</p>
            </div>
            <SafeIcon icon={FiActivity} className="w-6 h-6 text-primary" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <SafeIcon icon={FiUsers} className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Daily Active Users</p>
                  <p className="text-2xl font-bold text-neutral-800">{studentEngagement.dailyActiveUsers}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <SafeIcon icon={FiClock} className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Avg Session Duration</p>
                  <p className="text-2xl font-bold text-neutral-800">{studentEngagement.avgSessionDuration} min</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-xs text-neutral-600 mb-1">Weekly Active</p>
                <p className="text-xl font-bold text-neutral-800">{studentEngagement.weeklyActiveUsers}</p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-xs text-neutral-600 mb-1">Monthly Active</p>
                <p className="text-xl font-bold text-neutral-800">{studentEngagement.monthlyActiveUsers}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-xs text-neutral-600 mb-1">Discussion Posts</p>
                <p className="text-xl font-bold text-neutral-800">{studentEngagement.discussionPosts}</p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-xs text-neutral-600 mb-1">Questions Asked</p>
                <p className="text-xl font-bold text-neutral-800">{studentEngagement.questionsAsked}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Demographics & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demographics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-800">Student Demographics</h2>
              <p className="text-sm text-neutral-500 mt-1">Age distribution & locations</p>
            </div>
            <SafeIcon icon={FiPieChart} className="w-6 h-6 text-primary" />
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-neutral-700 mb-3">Age Groups</h3>
              <div className="space-y-3">
                {demographics.ageGroups.map((group, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">{group.range}</span>
                      <span className="font-medium text-neutral-800">{group.percentage}%</span>
                    </div>
                    <ProgressBar percentage={group.percentage} color="bg-accent" />
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-neutral-700 mb-3">Top Locations</h3>
              <div className="space-y-2">
                {demographics.locations.map((location, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <span className="text-sm text-neutral-700">{location.city}</span>
                    <span className="text-sm font-semibold text-neutral-800">{location.students} students</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-800">Top Performers</h2>
              <p className="text-sm text-neutral-500 mt-1">Students with highest scores</p>
            </div>
            <SafeIcon icon={FiTarget} className="w-6 h-6 text-primary" />
          </div>
          
          <div className="space-y-4">
            {topPerformers.map((student, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                <div className="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-neutral-800">{student.name}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-neutral-500">Progress: {student.progress}%</span>
                    <span className="text-xs text-neutral-500">Score: {student.score}%</span>
                    <span className="text-xs text-neutral-500">{student.timeSpent} days</span>
                  </div>
                </div>
                <SafeIcon icon={FiAward} className="w-5 h-5 text-yellow-500" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Additional Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-gradient-to-br from-primary to-primary-600 p-6 rounded-xl text-white"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Insights & Recommendations</h2>
            <ul className="space-y-2 text-sm opacity-90">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Module 5 has the lowest completion rate (68%). Consider adding more support materials or breaking it into smaller sections.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Student engagement increased by 15% this month. The discussion forum feature is driving this growth.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Average completion time is 20% faster than industry standards. Your content structure is effective.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Lagos has the highest concentration of students. Consider hosting in-person meetups or workshops there.</span>
              </li>
            </ul>
          </div>
          <SafeIcon icon={FiEye} className="w-12 h-12 opacity-50" />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CourseAnalytics;