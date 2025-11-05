import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTraining } from '../context/TrainingContext';
import { courses } from '../data/courses';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlay, FiCheck, FiAward, FiClock, FiTrendingUp, FiUser, FiSettings } = FiIcons;

const TrainingDashboard = () => {
  const { progress, user } = useTraining();

  const getOverallStats = () => {
    const totalCourses = courses.length;
    const completedCourses = courses.filter(course => {
      const courseProgress = progress[course.id];
      return courseProgress && courseProgress.certified;
    }).length;
    const inProgressCourses = courses.filter(course => {
      const courseProgress = progress[course.id];
      return courseProgress && courseProgress.completedLessons.length > 0 && !courseProgress.certified;
    }).length;
    const totalCertificates = completedCourses;
    return { totalCourses, completedCourses, inProgressCourses, totalCertificates };
  };

  const stats = getOverallStats();

  const getCourseProgress = (course) => {
    const courseProgress = progress[course.id];
    const completedLessons = courseProgress?.completedLessons?.length || 0;
    const totalLessons = course.lessons.length;
    const progressPercent = (completedLessons / totalLessons) * 100;
    return { completedLessons, totalLessons, progressPercent, isCertified: courseProgress?.certified || false, certificateId: courseProgress?.certificate_id };
  };

  const recentActivity = courses
    .map(course => ({ course, ...getCourseProgress(course) }))
    .filter(item => item.completedLessons > 0)
    .sort((a, b) => b.progressPercent - a.progressPercent)
    .slice(0, 3);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-neutral-100">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-container mx-auto px-5 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-primary w-12 h-12 rounded-full flex items-center justify-center mr-4">
                <SafeIcon icon={FiUser} className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold text-neutral-900"> Training Dashboard </h1>
                <p className="text-neutral-600"> Welcome back! Continue your learning journey. </p>
              </div>
            </div>
            <Link to="/training" className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors">
              Browse Courses
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-container mx-auto px-5 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[{ title: 'Courses Completed', value: stats.completedCourses, total: stats.totalCourses, icon: FiCheck, color: 'text-accent' }, { title: 'In Progress', value: stats.inProgressCourses, icon: FiPlay, color: 'text-primary' }, { title: 'Certificates Earned', value: stats.totalCertificates, icon: FiAward, color: 'text-accent' }, { title: 'Overall Progress', value: Math.round((stats.completedCourses / stats.totalCourses) * 100), suffix: '%', icon: FiTrendingUp, color: 'text-primary' }].map((stat, index) => (
            <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <SafeIcon icon={stat.icon} className={`w-8 h-8 ${stat.color}`} />
                <div className="text-right">
                  <div className="text-2xl font-bold text-neutral-900">
                    {stat.value}{stat.suffix}
                    {stat.total && <span className="text-neutral-400">/{stat.total}</span>}
                  </div>
                </div>
              </div>
              <h3 className="text-sm font-medium text-neutral-600"> {stat.title} </h3>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-heading font-bold text-neutral-900 mb-6"> Recent Activity </h2>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((item) => (
                  <div key={item.course.id} className="border-l-4 border-primary pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-neutral-900"> {item.course.title} </h3>
                      {item.isCertified && (
                        <SafeIcon icon={FiAward} className="w-5 h-5 text-accent" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-neutral-600"> {item.completedLessons} of {item.totalLessons} lessons </div>
                      <div className="text-sm font-medium text-primary"> {Math.round(item.progressPercent)}% </div>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
                      <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${item.progressPercent}%` }}></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <SafeIcon icon={FiPlay} className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600">No courses started yet</p>
                  <Link to="/training" className="text-primary hover:text-primary-600 font-medium">
                    Start your first course
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Certificates */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-heading font-bold text-neutral-900 mb-6"> My Certificates </h2>
            <div className="space-y-4">
              {courses
                .filter(course => {
                  const courseProgress = progress[course.id];
                  return courseProgress && courseProgress.certified;
                })
                .map((course) => {
                  const courseProgress = progress[course.id];
                  return (
                    <div key={course.id} className="border border-neutral-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <SafeIcon icon={FiAward} className="w-6 h-6 text-accent mr-3" />
                          <div>
                            <h3 className="font-semibold text-neutral-900"> {course.certificate} </h3>
                            <p className="text-sm text-neutral-600"> {course.title} </p>
                            <p className="text-xs text-neutral-500"> ID: {courseProgress.certificate_id} </p>
                          </div>
                        </div>
                        <button className="text-primary hover:text-primary-600 text-sm font-medium"> Download </button>
                      </div>
                    </div>
                  );
                })}
              {stats.totalCertificates === 0 && (
                <div className="text-center py-8">
                  <SafeIcon icon={FiAward} className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600">No certificates earned yet</p>
                  <p className="text-sm text-neutral-500"> Complete courses to earn certificates </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* All Courses Progress */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-heading font-bold text-neutral-900 mb-6"> All Courses </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => {
              const courseData = getCourseProgress(course);
              return (
                <div key={course.id} className="border border-neutral-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-900 mb-2"> {course.title} </h3>
                      <p className="text-sm text-neutral-600 mb-3"> {course.description} </p>
                      <div className="flex items-center text-sm text-neutral-500">
                        <SafeIcon icon={FiClock} className="w-4 h-4 mr-1" /> {course.lessons.length} lessons
                      </div>
                    </div>
                    {courseData.isCertified && (
                      <SafeIcon icon={FiAward} className="w-6 h-6 text-accent ml-4" />
                    )}
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{courseData.completedLessons}/{courseData.totalLessons}</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all duration-300 ${courseData.isCertified ? 'bg-accent' : 'bg-primary'}`} style={{ width: `${courseData.progressPercent}%` }}></div>
                    </div>
                  </div>
                  <Link to={`/training/course/${course.id}`} className="w-full bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors inline-flex items-center justify-center">
                    {courseData.completedLessons > 0 ? 'Continue' : 'Start Course'}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default TrainingDashboard;