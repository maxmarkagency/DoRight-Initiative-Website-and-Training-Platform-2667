import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner';

const { FiAward, FiDownload, FiCalendar, FiCheckCircle } = FiIcons;

const StudentCertificates = () => {
  // Mock data for certificates
  const certificates = [
    {
      id: 1,
      courseName: 'Foundations of Integrity',
      completedDate: '2024-11-05',
      certificateNumber: 'LMS-001',
      downloadUrl: '#'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">My Certificates</h1>
        <p className="text-gray-400">Your completed course achievements and certificates</p>
      </motion.div>

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 p-6 rounded-xl"
            >
              <div className="text-center">
                <div className="p-4 bg-accent/20 rounded-full text-accent w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <SafeIcon icon={FiAward} className="text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{cert.courseName}</h3>
                <div className="space-y-2 text-sm text-gray-400 mb-4">
                  <div className="flex items-center justify-center space-x-2">
                    <SafeIcon icon={FiCalendar} className="w-4 h-4" />
                    <span>Completed: {new Date(cert.completedDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <SafeIcon icon={FiCheckCircle} className="w-4 h-4" />
                    <span>Certificate #{cert.certificateNumber}</span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-accent text-black font-semibold py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
                >
                  <SafeIcon icon={FiDownload} className="w-4 h-4" />
                  <span>Download</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 p-12 rounded-xl text-center">
          <SafeIcon icon={FiAward} className="text-6xl text-gray-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-4">No Certificates Yet</h3>
          <p className="text-gray-400 mb-6">Complete your first course to earn a certificate</p>
        </div>
      )}
    </div>
  );
};

export default StudentCertificates;