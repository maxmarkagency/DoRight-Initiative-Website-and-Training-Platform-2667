import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTraining } from '../context/TrainingContext';
import { courses } from '../data/courses';
import SafeIcon from '../common/SafeIcon';
import LoadingSpinner from '../components/LoadingSpinner';
import * as FiIcons from 'react-icons/fi';

const { FiBookOpen, FiPlay, FiClock, FiAward, FiCheck, FiLock, FiUser } = FiIcons;

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

const CourseCard = ({ course, isEnrolled, isComplete }) => {
  const { getLessonProgress } = useTraining();
  const totalLessons = course.lessons.length;
  const completedLessons = course.lessons.filter(lesson => getLessonProgress(lesson.id).completed).length;
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <motion.div
      className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300"
      whileHover={{ scale: 1.02 }}
    >
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-primary to-accent flex items-center justify-center">
          {course.image ? (
            <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <SafeIcon icon={FiBookOpen} className="text-6xl text-white opacity-80" />
          )}
        </div>
        <div className="absolute top-4 right-4">
          <span className="bg-accent text-black px-3 py-1 rounded-full text-sm font-semibold">
            {course.level}
          </span>
        </div>
        {isComplete && (
          <div className="absolute top-4 left-4">
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
              <SafeIcon icon={FiCheck} className="w-4 h-4 mr-1" />
              Completed
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="text-sm text-accent mb-1 font-medium">{course.category}</div>
        <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>
        
        {isEnrolled && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {completedLessons} of {totalLessons} lessons complete
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
          <div className="flex items-center space-x-1">
            <SafeIcon icon={FiClock} className="w-4 h-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center space-x-1">
            <SafeIcon icon={FiAward} className="w-4 h-4" />
            <span>Certificate</span>
          </div>
        </div>

        <Link to={`/dashboard/course/${course.id}`}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-accent text-black font-semibold py-3 px-4 rounded-lg hover:brightness-90 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <SafeIcon icon={FiBookOpen} className="w-4 h-4" />
            <span>View Course</span>
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
};

const DashboardCourses = () => {
  const { loading, error } = useTraining();

  if (loading) {
    return <div className="min-h-screen bg-primary flex items-center justify-center"><LoadingSpinner /></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary text-white flex items-center justify-center p-8">
        <div className="bg-red-500/20 text-red-300 p-6 rounded-lg flex items-center max-w-lg text-center">
          <SafeIcon icon={FiBookOpen} className="text-3xl mr-4" />
          <div>
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p>We couldn't load your dashboard. Please try refreshing the page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2">Available Courses</h1>
          <p className="text-gray-400 text-lg">Explore our training catalog and start your learning journey</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatCard icon={FiBookOpen} title="Total Courses" value={courses.length} color="accent" />
          <StatCard icon={FiUser} title="Beginner Courses" value={courses.filter(c => c.level === 'Beginner').length} color="blue" />
          <StatCard icon={FiAward} title="Intermediate Courses" value={courses.filter(c => c.level === 'Intermediate').length} color="green" />
          <StatCard icon={FiClock} title="Advanced Courses" value={courses.filter(c => c.level === 'Advanced').length} color="purple" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CourseCard 
                course={course} 
                isEnrolled={true} 
                isComplete={false} 
              />
            </motion.div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <SafeIcon icon={FiBookOpen} className="text-6xl text-gray-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">No Courses Available</h3>
            <p className="text-gray-400">Check back later for new courses</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCourses;