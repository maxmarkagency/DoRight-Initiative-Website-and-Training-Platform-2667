import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';
import TrainingDashboard from '../../pages/TrainingDashboard';
import DashboardCourses from '../../pages/DashboardCourses';
import DashboardCoursePage from '../../pages/DashboardCoursePage';
import StudentProgress from '../../pages/student/StudentProgress';
import StudentCertificates from '../../pages/student/StudentCertificates';
import StudentCalendar from '../../pages/student/StudentCalendar';
import StudentForum from '../../pages/student/StudentForum';
import StudentProfile from '../../pages/student/StudentProfile';
import StudentSettings from '../../pages/student/StudentSettings';

const StudentLayout = () => {
  return (
    <div className="flex h-screen bg-primary">
      <StudentSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <StudentHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-primary p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TrainingDashboard />} />
            <Route path="courses" element={<DashboardCourses />} />
            <Route path="course/:courseId" element={<DashboardCoursePage />} />
            <Route path="progress" element={<StudentProgress />} />
            <Route path="calendar" element={<StudentCalendar />} />
            <Route path="certificates" element={<StudentCertificates />} />
            <Route path="forum" element={<StudentForum />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="settings" element={<StudentSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;