import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../../lib/supabase';

const { FiSearch, FiFilter, FiPlus, FiMoreVertical, FiBarChart2, FiEye } = FiIcons;

const CourseManagement = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchCourses();
  }, [statusFilter, searchTerm]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('courses')
        .select(`
          *,
          instructor:instructor_id(full_name),
          enrollments(count)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statuses = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-accent/20 text-neutral-800',
      archived: 'bg-neutral-200 text-neutral-700',
    };
    return statuses[status] || 'bg-neutral-200 text-neutral-700';
  };

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleViewAnalytics = (courseId) => {
    navigate('/admin/analytics');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-neutral-800">Course Management</h1>
        <button 
          onClick={() => alert('This feature is not yet implemented.')}
          className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors flex items-center"
        >
          <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" /> Add Course
        </button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="relative w-full max-w-sm">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-neutral-50 border border-neutral-200 rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-600 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Instructor</th>
                <th className="p-4">Status</th>
                <th className="p-4">Enrolled</th>
                <th className="p-4">Created Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-neutral-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    Loading courses...
                  </td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-neutral-500">
                    No courses found
                  </td>
                </tr>
              ) : (
                courses.map(course => (
                  <tr key={course.id} className="hover:bg-neutral-50">
                    <td className="p-4 font-medium text-neutral-800">{course.title}</td>
                    <td className="p-4 text-neutral-600">{course.instructor?.full_name || 'Unassigned'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full font-medium text-xs ${getStatusBadge(course.status)}`}>
                        {formatStatus(course.status)}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-600">{course.enrollments?.[0]?.count || 0}</td>
                    <td className="p-4 text-neutral-600">
                      {new Date(course.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewAnalytics(course.id)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="View Analytics"
                        >
                          <SafeIcon icon={FiBarChart2} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/dashboard/course/${course.id}`)}
                          className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                          title="View Course"
                        >
                          <SafeIcon icon={FiEye} className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg transition-colors">
                          <SafeIcon icon={FiMoreVertical} className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseManagement;