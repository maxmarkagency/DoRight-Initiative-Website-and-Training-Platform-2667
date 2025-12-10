import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import DashboardOverview from '../../pages/admin/DashboardOverview';
import UserManagement from '../../pages/admin/UserManagement';
import CourseManagement from '../../pages/admin/CourseManagement';
import BlogManagement from '../../pages/admin/BlogManagement';
import GalleryManagement from '../../pages/admin/GalleryManagement';
import MediaManagement from '../../pages/admin/MediaManagement';
import Settings from '../../pages/admin/Settings';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
          <Routes>
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="courses" element={<CourseManagement />} />
                        <Route path="blog" element={<BlogManagement />} />
                        <Route path="gallery" element={<GalleryManagement />} />
                        <Route path="media" element={<MediaManagement />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="/" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;