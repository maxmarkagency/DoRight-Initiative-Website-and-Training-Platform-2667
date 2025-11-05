import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTraining } from '../context/TrainingContext';
import { courses } from '../data/courses';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlay, FiCheck, FiClock, FiAward, FiArrowLeft, FiLock, FiDownload } = FiIcons;

const CoursePage = () => {
  const { courseId } = useParams();
  const { progress, completeLesson, claimCertificate, isCourseUnlocked, isCourseComplete } = useTraining();
  const [currentLesson, setCurrentLesson] = useState(0);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const course = courses.find(c => c.id === courseId);

  if (!course) {
    return <Navigate to="/training" replace />;
  }

  const isUnlocked = isCourseUnlocked(course, courses);
  const courseProgress = progress[course.id] || { completedLessons: [], certified: false };
  const completedLessons = courseProgress.completedLessons || [];
  const isComplete = isCourseComplete(course);

  if (!isUnlocked) {
    return <Navigate to="/training" replace />;
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
    // Simple certificate generation - in production,this would be server-side
    const certificateContent = `
      Doing Right Awareness Initiative
      Certificate of Completion

      This certifies that you have successfully completed:
      ${course.title}

      Certificate ID: ${courseProgress.certificate_id}
      Date: ${new Date().toLocaleDateString()}

      Congratulations on your achievement!
    `;
    const blob = new Blob([certificateContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DoingRight-Certificate-${course.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-neutral-100">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-container mx-auto px-5 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/training" className="text-primary hover:text-primary-600 transition-colors mr-4">
                <SafeIcon icon={FiArrowLeft} className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-heading font-bold text-neutral-900"> {course.title} </h1>
                <p className="text-neutral-600"> {completedLessons.length} of {course.lessons.length} lessons complete </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-neutral-600 mb-1">Progress</div>
              <div className="w-32 bg-neutral-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${(completedLessons.length / course.lessons.length) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-container mx-auto px-5 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Mock Video Player */}
              <div className="bg-black aspect-video flex items-center justify-center">
                <div className="text-center text-white">
                  <SafeIcon icon={FiPlay} className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2"> {course.lessons[currentLesson]?.title} </h3>
                  <p className="text-gray-300"> Duration: {course.lessons[currentLesson]?.duration} </p>
                  <p className="text-sm text-gray-400 mt-4"> Video player would be integrated here </p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-heading font-bold text-neutral-900"> {course.lessons[currentLesson]?.title} </h2>
                  {completedLessons.includes(course.lessons[currentLesson]?.id) ? (
                    <div className="bg-accent text-neutral-900 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <SafeIcon icon={FiCheck} className="w-4 h-4 mr-1" /> Completed
                    </div>
                  ) : (
                    <button onClick={() => handleCompleteLesson(course.lessons[currentLesson]?.id)} className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors">
                      Mark Complete
                    </button>
                  )}
                </div>
                <p className="text-neutral-700 leading-relaxed">
                  This lesson covers the fundamental concepts and practical applications related to {course.lessons[currentLesson]?.title.toLowerCase()}. You'll learn key principles and how to apply them in real-world situations.
                </p>
              </div>
            </div>

            {/* Certificate Section */}
            {isComplete && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-accent text-neutral-900 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <SafeIcon icon={FiAward} className="w-8 h-8 mr-4" />
                    <div>
                      <h3 className="text-xl font-bold">Congratulations!</h3>
                      <p>You've completed all lessons in this course.</p>
                    </div>
                  </div>
                  {courseProgress.certified ? (
                    <button onClick={generateCertificatePDF} className="bg-white text-neutral-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center">
                      <SafeIcon icon={FiDownload} className="mr-2 w-5 h-5" /> Download Certificate
                    </button>
                  ) : (
                    <button onClick={handleClaimCertificate} className="bg-white text-neutral-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                      Claim Certificate
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Lesson List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-heading font-bold text-neutral-900 mb-6"> Course Lessons </h3>
            <div className="space-y-3">
              {course.lessons.map((lesson, index) => {
                const isCompleted = completedLessons.includes(lesson.id);
                const isCurrent = index === currentLesson;
                return (
                  <button key={lesson.id} onClick={() => setCurrentLesson(index)} className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${isCurrent ? 'border-primary bg-neutral-50' : 'border-neutral-200 hover:border-neutral-300'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        {isCompleted ? (
                          <SafeIcon icon={FiCheck} className="w-5 h-5 text-accent mr-3 flex-shrink-0" />
                        ) : (
                          <SafeIcon icon={FiPlay} className="w-5 h-5 text-neutral-400 mr-3 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-neutral-900 mb-1"> {lesson.title} </h4>
                          <div className="flex items-center text-sm text-neutral-600">
                            <SafeIcon icon={FiClock} className="w-4 h-4 mr-1" /> {lesson.duration}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {/* Assessment Info */}
            <div className="mt-8 p-4 bg-neutral-50 rounded-lg">
              <h4 className="font-semibold text-neutral-900 mb-2">Final Assessment</h4>
              <p className="text-sm text-neutral-600 mb-3"> {course.assessment.type === 'quiz' ? `Quiz with ${course.assessment.questions} questions` : course.assessment.instructions} </p>
              <p className="text-sm text-neutral-600"> Pass rate: {course.assessment.pass_percent}% </p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="text-center">
              <SafeIcon icon={FiAward} className="w-16 h-16 text-accent mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-neutral-900 mb-4"> Certificate Earned! </h3>
              <p className="text-neutral-700 mb-6"> Congratulations! You've successfully completed {course.title} and earned your {course.certificate}. </p>
              <div className="space-y-3">
                <button onClick={generateCertificatePDF} className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center">
                  <SafeIcon icon={FiDownload} className="mr-2 w-5 h-5" /> Download Certificate
                </button>
                <button onClick={() => setShowCertificateModal(false)} className="w-full bg-neutral-200 text-neutral-700 px-6 py-3 rounded-lg font-semibold hover:bg-neutral-300 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
export default CoursePage;