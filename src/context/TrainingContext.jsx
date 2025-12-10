import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import supabase from '../lib/supabase';
import { courses as mockCourses, lessons as mockLessons } from '../data/courses';

const TrainingContext = createContext();

export const useTraining = () => useContext(TrainingContext);

export const TrainingProvider = ({ children }) => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrainingData = async () => {
      if (!user) {
        setCourses(mockCourses);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch all courses
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*');
        if (coursesError) throw coursesError;
        setCourses(coursesData.length > 0 ? coursesData : mockCourses);

        // Fetch user's enrollments
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('*, courses(*)')
          .eq('user_id', user.id);
        if (enrollmentsError) throw enrollmentsError;
        setEnrollments(enrollmentsData);

        // Fetch user's progress
        const { data: progressData, error: progressError } = await supabase
          .from('progress')
          .select('*')
          .eq('user_id', user.id);

        if (progressError) throw progressError;

        const progressMap = progressData.reduce((acc, p) => {
            acc[p.lesson_id] = p;
            return acc;
        }, {});
        setProgress(progressMap);

      } catch (err) {
        console.error("Error fetching training data:", err);
        setError(err.message);
        setCourses(mockCourses); // Fallback to mock data on error
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingData();
  }, [user]);

  const getCourseById = (courseId) => {
    return courses.find(c => c.id === courseId);
  };

  const getLessonsForCourse = (courseId) => {
    // This is still mock. In a real scenario, you'd fetch this from Supabase.
    return mockLessons[courseId] || [];
  };

  const getLessonProgress = (lessonId) => {
    return progress[lessonId] || { completed: false };
  };

  const isCourseUnlocked = (course, allCourses) => {
    if (!course.prerequisite) return true;
    const prerequisiteCourse = allCourses.find(c => c.id === course.prerequisite);
    if (!prerequisiteCourse) return true;
    
    // Check if prerequisite course is completed
    const prerequisiteProgress = progress[prerequisiteCourse.id];
    if (!prerequisiteProgress) return false;
    
    // Check if all lessons in prerequisite are completed
    const prerequisiteLessons = getLessonsForCourse(prerequisiteCourse.id);
    return prerequisiteLessons.every(lesson => {
      const lessonProgress = progress[lesson.id];
      return lessonProgress?.completed || false;
    });
  };

  const isCourseComplete = (course) => {
    // Check if all lessons in the course are completed
    const courseLessons = course.lessons || getLessonsForCourse(course.id);
    return courseLessons.every(lesson => {
      const lessonProgress = progress[lesson.id];
      return lessonProgress?.completed || false;
    });
  };

  const completeLesson = (courseId, lessonId) => {
    toggleLessonCompleted(lessonId, courseId);
  };

  const claimCertificate = (course) => {
    // Mock certificate claiming - in production, this would be server-side
    const isComplete = isCourseComplete(course);
    if (isComplete) {
      // Update course progress to mark as certified
      setProgress(prev => ({
        ...prev,
        [courseId]: {
          ...prev[courseId],
          certified: true,
          certificate_id: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
      }));
      return { ok: true, msg: "Certificate claimed successfully!" };
    } else {
      return { ok: false, msg: "Please complete all lessons before claiming your certificate." };
    }
  };
  
  const toggleLessonCompleted = async (lessonId, courseId) => {
    if (!user) return;

    const currentProgress = getLessonProgress(lessonId);
    const newCompletedStatus = !currentProgress.completed;

    setProgress(prev => ({
        ...prev,
        [lessonId]: {
            ...prev[lessonId],
            user_id: user.id,
            lesson_id: lessonId,
            completed: newCompletedStatus,
            updated_at: new Date().toISOString(),
        }
    }));
    
    try {
        const { error } = await supabase
            .from('progress')
            .upsert({
                user_id: user.id,
                lesson_id: lessonId,
                completed: newCompletedStatus,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id, lesson_id' });
        
        if (error) throw error;

    } catch (err) {
        console.error("Error updating lesson progress:", err);
        // Revert optimistic update on failure
        setProgress(prev => ({
            ...prev,
            [lessonId]: currentProgress
        }));
    }
  };

  const value = {
    loading,
    error,
    courses,
    enrollments,
    progress,
    getCourseById,
    getLessonsForCourse,
    getLessonProgress,
    toggleLessonCompleted,
    completeLesson,
    claimCertificate,
    isCourseUnlocked,
    isCourseComplete,
    userProgress: { // This is mock, replace with calculations from real data
      overallPercentage: 65,
      completedCourses: enrollments.filter(e => e.status === 'completed').length,
      inProgressCourses: enrollments.filter(e => e.status === 'active').length,
    }
  };

  return (
    <TrainingContext.Provider value={value}>
      {children}
    </TrainingContext.Provider>
  );
};