import React from 'react';
import { motion } from 'framer-motion';
import useSeo from '../hooks/useSeo';
import usePageContent from '../cms/usePageContent';
import PageRenderer from '../cms/PageRenderer';
import programsConfig from '../cms/pages/programs.config';

// Content is edited in Admin → Pages → Programs; defaults live in src/cms/pages/programs.config.js.
const Programs = () => {
  const { data, ready } = usePageContent('programs');

  useSeo({
    path: '/programs',
    title: data.root.props.seoTitle,
    description: data.root.props.seoDescription,
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
      {ready ? (
        <PageRenderer data={data} config={programsConfig} />
      ) : (
        // Hero-sized placeholder keeps the transparent header readable while content loads.
        <div className="min-h-[360px] bg-primary" aria-hidden="true" />
      )}
    </motion.div>
  );
};

export default Programs;
