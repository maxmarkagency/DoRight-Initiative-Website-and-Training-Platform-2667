import React from 'react';
import { motion } from 'framer-motion';

const AdminModal = ({ isOpen, maxWidth = 'max-w-2xl', children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`bg-white dark:bg-gray-800 rounded-lg p-6 ${maxWidth} w-full max-h-[90vh] overflow-y-auto`}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default AdminModal;
