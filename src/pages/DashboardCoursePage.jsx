import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTraining } from '../context/TrainingContext';
import { courses } from '../data/courses';
import SafeIcon from '../common/SafeIcon';
import LoadingSpinner from '../components/LoadingSpinner';
import * as FiIcons from 'react-icons/fi';

const { FiPlay, FiCheck, FiClock, FiAward, FiArrowLeft, FiLock, FiDownload, FiBookOpen, FiFileText, FiVideo, FiTarget } = FiIcons;

const DashboardCoursePage = () => {
  const { courseId } = useParams();
  const { completeLesson, claimCertificate, isCourseUnlocked, isCourseComplete } = useTraining();
  const [currentLesson, setCurrentLesson] = useState(0);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  
  const course = courses.find(c => c.id === courseId);

  if (!course) {
    return <Navigate to="/dashboard/courses" replace />;
  }

  const isUnlocked = isCourseUnlocked(course, courses);
  const isComplete = isCourseComplete(course);

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-primary text-white p-8">
        <div className="max-w-4xl mx-auto text-center">
          <SafeIcon icon={FiLock} className="text-6xl text-gray-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Course Locked</h1>
          <p className="text-gray-400 mb-6">You need to complete the prerequisite course to access this content.</p>
          <Link to="/dashboard/courses" className="bg-accent text-black px-6 py-3 rounded-lg font-semibold hover:brightness-90 transition-colors inline-flex items-center">
            <SafeIcon icon={FiArrowLeft} className="mr-2 w-5 h-5" />
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const handleCompleteLesson = (lessonId) => {
    completeLesson(course.id, lessonId);
  };

  const handleClaimCertificate = () => {
    const result = claimCertificate(course);
    if (result.ok) {
      setShowCertificateModal(true);
    } else {
      alert(result.msg);
    }
  };

  const generateCertificatePDF = () => {
    const certificateContent = `
      DoRight Foundation
      Certificate of Completion

      This certifies that you have successfully completed:
      ${course.title}

      Date: ${new Date().toLocaleDateString()}

      Congratulations on your achievement!
    `;
    const blob = new Blob([certificateContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DoRight-Certificate-${course.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLessonIcon = (contentType) => {
    switch (contentType) {
      case 'video': return FiVideo;
      case 'text': return FiFileText;
      case 'quiz': return FiTarget;
      default: return FiBookOpen;
    }
  };

  return (
    <div className="min-h-screen bg-primary text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard/courses" className="text-accent hover:text-yellow-400 transition-colors inline-flex items-center mb-4">
            <SafeIcon icon={FiArrowLeft} className="mr-2 w-5 h-5" />
            Back to Courses
          </Link>
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="text-sm text-accent mb-1 font-medium">{course.category}</div>
                <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                <p className="text-gray-400 mb-4">{course.description}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <SafeIcon icon={FiClock} className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <SafeIcon icon={FiAward} className="w-4 h-4" />
                    <span>{course.level}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <SafeIcon icon={FiBookOpen} className="w-4 h-4" />
                    <span>{course.lessons.length} lessons</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 lg:mt-0">
                {isComplete ? (
                  <motion.button
                    onClick={handleClaimCertificate}
                    className="bg-accent text-black px-6 py-3 rounded-lg font-semibold hover:brightness-90 transition-colors inline-flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <SafeIcon icon={FiAward} className="mr-2 w-5 h-5" />
                    Claim Certificate
                  </motion.button>
                ) : (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent mb-1">
                      {Math.round((course.lessons.filter(l => l.completed).length / course.lessons.length) * 100)}%
                    </div>
                    <div className="text-sm text-gray-400">Complete</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Current Lesson */}
            <div className="bg-gray-800 rounded-xl p-6 mb-6">
              <div className="aspect-video bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <SafeIcon icon={FiPlay} className="text-4xl text-gray-400" />
                <span className="ml-2 text-gray-400">Video Player</span>
              </div>
              <h2 className="text-xl font-bold mb-2">{course.lessons[currentLesson]?.title}</h2>
              <p className="text-gray-400 mb-4">Duration: {course.lessons[currentLesson]?.duration}</p>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleCompleteLesson(course.lessons[currentLesson]?.id)}
                  className="bg-accent text-black px-4 py-2 rounded-lg font-semibold hover:brightness-90 transition-colors inline-flex items-center"
                >
                  <SafeIcon icon={FiCheck} className="mr-2 w-4 h-4" />
                  Mark as Complete
                </button>
              </div>
            </div>

            {/* Assessment Info */}
            {course.assessment && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <SafeIcon icon={FiTarget} className="mr-2 w-5 h-5" />
                  Final Assessment
                </h3>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white font-semibold capitalize">{course.assessment.type}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Passing Score:</span>
                    <span className="text-white font-semibold">{course.assessment.pass_percent}%</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{course.assessment.instructions}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Course Progress */}
            <div className="bg-gray-800 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Your Progress</h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Completed</span>
                  <span>{course.lessons.filter(l => l.completed).length} / {course.lessons.length}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(course.lessons.filter(l => l.completed).length / course.lessons.length) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
              {isComplete && (
                <div className="bg-green-500/20 text-green-400 p-3 rounded-lg text-center">
                  <SafeIcon icon={FiCheck} className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-semibold">Course Complete!</div>
                </div>
              )}
            </div>

            {/* Lessons List */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Lessons</h3>
              <div className="space-y-2">
                {course.lessons.map((lesson, index) => (
                  <motion.button
                    key={lesson.id}
                    onClick={() => setCurrentLesson(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentLesson === index 
                        ? 'bg-accent text-black' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <SafeIcon 
                        icon={lesson.completed ? FiCheck : getLessonIcon('video')} 
                        className={`w-4 h-4 ${lesson.completed ? 'text-green-400' : 'text-gray-400'}`} 
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{lesson.title}</div>
                        <div className="text-xs opacity-70">{lesson.duration}</div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Modal */}
        {showCertificateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="bg-gray-800 rounded-lg p-8 max-w-md w-full"
            >
              <div className="text-center">
                <SafeIcon icon={FiAward} className="w-16 h-16 text-accent mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-4">Certificate Earned!</h3>
                <p className="text-gray-400 mb-6">
                  Congratulations! You've successfully completed {course.title} and earned your {course.certificate}.
                </p>
                <div className="space-y-3">
                  <button 
                    onClick={generateCertificatePDF} 
                    className="w-full bg-accent text-black px-6 py-3 rounded-lg font-semibold hover:brightness-90 transition-colors flex items-center justify-center"
                  >
                    <SafeIcon icon={FiDownload} className="mr-2 w-5 h-5" />
                    Download Certificate
                  </button>
                  <button 
                    onClick={() => setShowCertificateModal(false)} 
                    className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-500 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCoursePage;