import React from 'react';
import { motion } from 'framer-motion';
import useSeo from '../hooks/useSeo';
import usePageContent from '../cms/usePageContent';
import PageRenderer from '../cms/PageRenderer';
import aboutConfig from '../cms/pages/about.config';

// Content is edited in Admin → Pages → About; defaults live in src/cms/pages/about.config.js.
const About = () => {
  const { data, ready } = usePageContent('about');

  useSeo({
    path: '/about',
    title: data.root.props.seoTitle,
    description: data.root.props.seoDescription,
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
      {ready ? (
        <PageRenderer data={data} config={aboutConfig} />
      ) : (
        // Hero-sized placeholder keeps the transparent header readable while content loads.
        <div className="min-h-[480px] bg-primary" aria-hidden="true" />
      )}
    </motion.div>
  );
};

export default About;
