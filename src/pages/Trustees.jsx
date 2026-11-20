import React from 'react';
import { motion } from 'framer-motion';
import useSeo from '../hooks/useSeo';
import usePageContent from '../cms/usePageContent';
import PageRenderer from '../cms/PageRenderer';
import trusteesConfig from '../cms/pages/trustees.config';

// Content is edited in Admin → Pages → Trustees; defaults live in src/cms/pages/trustees.config.js.
const Trustees = () => {
  const { data, ready } = usePageContent('trustees');

  useSeo({
    path: '/trustees',
    title: data.root.props.seoTitle,
    description: data.root.props.seoDescription,
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
      {ready ? (
        <PageRenderer data={data} config={trusteesConfig} />
      ) : (
        // Hero-sized placeholder keeps the transparent header readable while content loads.
        <div className="min-h-[480px] bg-primary" aria-hidden="true" />
      )}
    </motion.div>
  );
};

export default Trustees;
