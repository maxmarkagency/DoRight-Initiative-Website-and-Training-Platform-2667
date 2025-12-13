import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { TrainingProvider } from './context/TrainingContext';

import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import LoadingTransition from './components/LoadingTransition';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import About from './pages/About';
import Programs from './pages/Programs';
import Training from './pages/Training';
import Join from './pages/Join';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Login from './pages/Login';
import Trustees from './pages/Trustees';
import Webinars from './pages/Webinars';
import CoursePage from './pages/CoursePage';
import Gallery from './pages/Gallery';
import Events from './pages/Events';

import AdminLayout from './components/admin/AdminLayout';
import StudentLayout from './components/student/StudentLayout';
import DashboardOverview from './pages/admin/DashboardOverview';
import UserManagement from './pages/admin/UserManagement';
import CourseManagement from './pages/admin/CourseManagement';
import CourseAnalytics from './pages/admin/CourseAnalytics';
import BlogManagement from './pages/admin/BlogManagement';
import GalleryManagement from './pages/admin/GalleryManagement';
import Settings from './pages/admin/Settings';
import ContentManagement from './pages/admin/ContentManagement';

function AppContent() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isStudentRoute = location.pathname.startsWith('/dashboard');

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        {isLoading && <LoadingTransition />}
      </AnimatePresence>
      
      {!isAdminRoute && !isStudentRoute && <Header />}
      
      <main className={!isAdminRoute && !isStudentRoute ? "pt-16 sm:pt-20" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/training" element={<Training />} />
          <Route path="/join" element={<Join />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/login" element={<Login />} />
          <Route path="/trustees" element={<Trustees />} />
          <Route path="/webinars" element={<Webinars />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/events" element={<Events />} />

          <Route path="/training/dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="/training/course/:courseId" element={
            <ProtectedRoute>
              <CoursePage />
            </ProtectedRoute>
          } />
          <Route path="/course/:courseId" element={
            <ProtectedRoute>
              <CoursePage />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Navigate to="/dashboard/dashboard" replace />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <StudentLayout />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/*" element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<DashboardOverview />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="courses" element={<CourseManagement />} />
            <Route path="analytics" element={<CourseAnalytics />} />
            <Route path="blog" element={<BlogManagement />} />
            <Route path="gallery" element={<GalleryManagement />} />
            <Route path="content" element={<ContentManagement />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </main>

      {!isAdminRoute && !isStudentRoute && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <TrainingProvider>
          <AppContent />
        </TrainingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;