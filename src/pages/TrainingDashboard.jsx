import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTraining } from '../context/TrainingContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';

const { FiTarget, FiPlus, FiCheck, FiClock, FiTrendingUp, FiBookOpen, FiAward, FiActivity, FiAlertCircle } = FiIcons;

const StatCard = ({ icon, title, value, color }) => (
  <motion.div
    className="bg-gray-800 p-6 rounded-xl flex items-center space-x-4"
    whileHover={{ scale: 1.05, backgroundColor: '#2d3748' }}
  >
    <div className={`p-3 rounded-full bg-${color}-500/20 text-${color}-400`}>
      <SafeIcon icon={icon} className="text-2xl" />
    </div>
    <div>
      <p className="text-gray-400 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </motion.div>
);

const CourseProgressCard = ({ course }) => {
  const { getLessonsForCourse, getLessonProgress } = useTraining();
  const lessons = getLessonsForCourse(course.id);
  const completedLessons = lessons.filter(lesson => getLessonProgress(lesson.id).completed).length;
  const progressPercentage = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;

  return (
    <motion.div
      className="bg-gray-800 p-6 rounded-xl space-y-4"
      whileHover={{ scale: 1.02, boxShadow: '0 10px 15px -3px rgba(251, 191, 36, 0.1), 0 4px 6px -2px rgba(251, 191, 36, 0.05)' }}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-accent uppercase font-semibold">{course.category || 'Category'}</p>
          <h3 className="text-xl font-bold text-white mt-1">{course.title}</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-accent">{progressPercentage}%</p>
          <p className="text-sm text-gray-400">Complete</p>
        </div>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div
          className="bg-accent h-2.5 rounded-full"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between items-center text-sm text-gray-400">
        <span>{completedLessons} / {lessons.length} Lessons</span>
        <Link to={`/course/${course.id}`} className="text-accent font-semibold hover:underline">
          Continue
        </Link>
      </div>
    </motion.div>
  );
};

const TrainingDashboard = () => {
  const { loading, error, enrollments, userProgress } = useTraining();

  if (loading) {
    return <div className="min-h-screen bg-primary flex items-center justify-center"><LoadingSpinner /></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary text-white flex items-center justify-center p-8">
        <div className="bg-red-500/20 text-red-300 p-6 rounded-lg flex items-center max-w-lg text-center">
            <SafeIcon icon={FiAlertCircle} className="text-3xl mr-4" />
            <div>
              <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
              <p>We couldn't load your dashboard data. Please try again later.</p>
              <p className="text-xs mt-2 text-red-400">Error: {error}</p>
            </div>
        </div>
      </div>
    );
  }

  const enrolledCourses = enrollments.map(e => e.courses);

  return (
    <div className="min-h-screen bg-primary text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2">Your Dashboard</h1>
          <p className="text-gray-400 text-lg">Welcome back, let's continue learning!</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatCard icon={FiBookOpen} title="Courses in Progress" value={enrollments.filter(e => e.status === 'active').length} color="accent" />
          <StatCard icon={FiAward} title="Completed Courses" value={enrollments.filter(e => e.status === 'completed').length} color="green" />
          <StatCard icon={FiTrendingUp} title="Overall Progress" value={`${userProgress.overallPercentage}%`} color="blue" />
          <StatCard icon={FiActivity} title="Total Courses" value={enrollments.length} color="purple" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">My Courses</h2>
            {enrolledCourses.length > 0 ? (
                <div className="space-y-6">
                    {enrolledCourses.map(course => (
                        <CourseProgressCard key={course.id} course={course} />
                    ))}
                </div>
            ) : (
                <div className="bg-gray-800 p-8 rounded-xl text-center">
                    <SafeIcon icon={FiBookOpen} className="text-5xl text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white">No Courses Yet</h3>
                    <p className="text-gray-400 mt-2">You haven't enrolled in any courses. Explore our training catalog to get started!</p>
                    <Link to="/training">
                        <motion.button 
                            className="mt-6 bg-accent text-primary font-bold py-2 px-6 rounded-lg hover:brightness-90 transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Explore Courses
                        </motion.button>
                    </Link>
                </div>
            )}
          </div>

          <div className="bg-gray-800 p-6 rounded-xl">
            <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {/* This section would be populated with dynamic data in a real app */}
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-accent/20 rounded-full text-accent">
                  <SafeIcon icon={FiCheck} />
                </div>
                <div>
                  <p className="font-semibold text-white">Lesson Completed</p>
                  <p className="text-sm text-gray-400">"Ethical Decision Making" in Foundations of Integrity</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500/20 rounded-full text-blue-400">
                  <SafeIcon icon={FiPlus} />
                </div>
                <div>
                  <p className="font-semibold text-white">New Course Enrolled</p>
                  <p className="text-sm text-gray-400">Leadership & Civic Responsibility</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500/20 rounded-full text-purple-400">
                  <SafeIcon icon={FiTarget} />
                </div>
                <div>
                  <p className="font-semibold text-white">Quiz Attempt</p>
                  <p className="text-sm text-gray-400">Scored 85% on "Core Values Quiz"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingDashboard;