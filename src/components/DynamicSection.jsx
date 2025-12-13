import React, { useState, useEffect } from 'react';
import cmsService from '../services/cmsService';

const DynamicSection = ({ pageName, sectionKey, fallback = null, children }) => {
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSection = async () => {
      try {
        setLoading(true);
        const data = await cmsService.getSection(pageName, sectionKey);
        setSection(data);
      } catch (err) {
        console.error('Error loading section:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSection();
  }, [pageName, sectionKey]);

  if (loading) {
    return <div className="animate-pulse bg-neutral-200 h-32 rounded-lg"></div>;
  }

  if (error || !section) {
    return fallback || <div>Error loading content</div>;
  }

  if (children && typeof children === 'function') {
    return children(section.content_data);
  }

  return null;
};

export default DynamicSection;
