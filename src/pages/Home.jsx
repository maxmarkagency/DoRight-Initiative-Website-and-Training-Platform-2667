import React from 'react';
import { motion, MotionConfig } from 'framer-motion';
import useSeo from '../hooks/useSeo';
import usePageContent from '../cms/usePageContent';
import PageRenderer from '../cms/PageRenderer';
import homeConfig from '../cms/pages/home.config';

// Content is edited in Admin → Pages → Home; defaults live in src/cms/pages/home.config.js.
const Home = () => {
  const { data, ready } = usePageContent('home');

  useSeo({
    path: '/',
    title: data.root.props.seoTitle,
    description: data.root.props.seoDescription,
  });

  return (
    <MotionConfig reducedMotion="user">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen w-full overflow-x-hidden">
        {ready ? (
          <PageRenderer data={data} config={homeConfig} />
        ) : (
          // Hero-sized dark placeholder keeps the transparent header readable while content loads.
          <div className="min-h-[640px] sm:min-h-[760px] lg:min-h-[880px] bg-black" aria-hidden="true" />
        )}
      </motion.div>
    </MotionConfig>
  );
};

export default Home;
