import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const TrainingContext = createContext();

export const useTraining = () => {
  const context = useContext(TrainingContext);
  if (!context) {
    throw new Error('useTraining must be used within a TrainingProvider');
  }
  return context;
};

export const TrainingProvider = ({ children }) => {
  const [progress, setProgress] = useState({});
  const { user } = useAuth();

  // Load progress from localStorage when user changes
  useEffect(() => {
    if (user) {
      loadUserProgress();
    } else {
      setProgress({});
    }
  }, [user]);

  const loadUserProgress = () => {
    if (!user) return;
    try {
      const savedProgress = localStorage.getItem(`doingright_training_${user.id}`);
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      } else {
        setProgress({});
      }
    } catch (e) {
      console.error('Error parsing saved progress:', e);
      setProgress({});
    }
  };

  const saveUserProgress = (newProgress) => {
    if (!user) return;
    try {
      localStorage.setItem(`doingright_training_${user.id}`, JSON.stringify(newProgress));
    } catch (e) {
      console.error('Error saving progress:', e);
    }
  };

  const completeLesson = (courseId, lessonId) => {
    if (!user) return;

    const courseProgress = progress[courseId] || { completedLessons: [], certified: false };
    if (!courseProgress.completedLessons.includes(lessonId)) {
      courseProgress.completedLessons.push(lessonId);
    }
    const newProgress = { ...progress, [courseId]: courseProgress };
    setProgress(newProgress);
    saveUserProgress(newProgress);
  };

  const claimCertificate = (courseSpec) => {
    if (!user) return { ok: false, msg: 'Please log in to claim certificates' };

    const courseProgress = progress[courseSpec.id];
    const allLessonsComplete = courseSpec.lessons.every(lesson =>
      courseProgress?.completedLessons.includes(lesson.id)
    );

    if (!allLessonsComplete) {
      return { ok: false, msg: 'Complete all lessons first' };
    }

    const certificateId = `DR-${courseSpec.id}-${user.id.substring(0, 8)}-${Date.now()}`;
    const updatedProgress = { ...courseProgress, certified: true, certificate_id: certificateId };
    const newProgress = { ...progress, [courseSpec.id]: updatedProgress };
    
    setProgress(newProgress);
    saveUserProgress(newProgress);

    return { ok: true, certificate_id: certificateId, template: courseSpec.certificate };
  };

  const isCourseUnlocked = (courseSpec, courses) => {
    if (!user) return false;
    if (!courseSpec.prerequisite) return true;
    const prereqProgress = progress[courseSpec.prerequisite];
    return prereqProgress && prereqProgress.certified === true;
  };

  const isCourseComplete = (courseSpec) => {
    if (!user) return false;
    const courseProgress = progress[courseSpec.id];
    if (!courseProgress) return false;
    return courseSpec.lessons.every(lesson => courseProgress.completedLessons.includes(lesson.id));
  };

  const value = {
    progress,
    user,
    completeLesson,
    claimCertificate,
    isCourseUnlocked,
    isCourseComplete,
  };

  return (
    <TrainingContext.Provider value={value}>
      {children}
    </TrainingContext.Provider>
  );
};