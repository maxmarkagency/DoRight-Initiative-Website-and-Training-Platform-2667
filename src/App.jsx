import React from 'react';
import {HashRouter as Router, Routes, Route, useLocation} from 'react-router-dom';
import {motion, AnimatePresence} from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import LoadingTransition from './components/LoadingTransition';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import Home from './pages/Home';
import About from './pages/About';
import Programs from './pages/Programs';
import Training from './pages/Training';
import TrainingDashboard from './pages/TrainingDashboard';
import CoursePage from './pages/CoursePage';
import Webinars from './pages/Webinars';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Gallery from './pages/Gallery';
import Trustees from './pages/Trustees';
import Join from './pages/Join';
import Contact from './pages/Contact';
import Login from './pages/Login';

// Admin Pages
import DashboardOverview from './pages/admin/DashboardOverview';
import UserManagement from './pages/admin/UserManagement';
import CourseManagement from './pages/admin/CourseManagement';
import Settings from './pages/admin/Settings';
import {AuthProvider} from './context/AuthContext';
import {TrainingProvider} from './context/TrainingContext';

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-neutral-100 w-full overflow-x-hidden">
      <ScrollToTop />
      {!isAdminRoute && <Header />}
      <main className="w-full">
        <LoadingTransition>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/training" element={<Training />} />
              <Route path="/login" element={<Login />} />
              <Route path="/training/dashboard" element={
                <ProtectedRoute>
                  <TrainingDashboard />
                </ProtectedRoute>
              } />
              <Route path="/training/course/:courseId" element={
                <ProtectedRoute>
                  <CoursePage />
                </ProtectedRoute>
              } />
              <Route path="/webinars" element={<Webinars />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:postId" element={<BlogPost />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/trustees" element={<Trustees />} />
              <Route path="/join" element={<Join />} />
              <Route path="/contact" element={<Contact />} />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<DashboardOverview />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="courses" element={<CourseManagement />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </AnimatePresence>
        </LoadingTransition>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <TrainingProvider>
        <Router>
          <AppContent />
        </Router>
      </TrainingProvider>
    </AuthProvider>
  );
}

export default App;