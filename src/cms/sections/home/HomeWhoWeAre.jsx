import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../common/SafeIcon';
import { FiArrowRight } from 'react-icons/fi';
import ButtonLink from '../ButtonLink';

const HomeWhoWeAre = ({ heading, paragraphs = [], button, image, imageCaptionTitle, imageCaptionText }) => (
  <section className="py-16 sm:py-24 bg-neutral-50 w-full relative overflow-hidden">
    <div className="relative w-full max-w-container mx-auto px-4 sm:px-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-center lg:text-left">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-black mb-6">{heading}</h2>
          <div className="space-y-6 text-base sm:text-lg text-neutral-700 leading-relaxed">
            {paragraphs.map((paragraph, i) => (
              <motion.p key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 * (i + 1) }} viewport={{ once: true }}>
                {paragraph.text}
              </motion.p>
            ))}
          </div>
          {button?.label && (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} viewport={{ once: true }} className="mt-8">
              <ButtonLink href={button.href} className="bg-black text-white px-8 py-4 rounded-lg font-semibold hover:bg-neutral-800 transition-all duration-300 inline-flex items-center">
                {button.label}
                <SafeIcon icon={FiArrowRight} className="ml-2 w-5 h-5" />
              </ButtonLink>
            </motion.div>
          )}
        </motion.div>
        {image?.url && (
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }} className="relative w-full">
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }} className="relative">
              <img src={image.url} alt={image.alt || ''} className="rounded-lg w-full h-auto" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl md:text-2xl font-heading font-bold mb-2">{imageCaptionTitle}</h3>
                <p className="text-sm md:text-base text-neutral-200 leading-relaxed">{imageCaptionText}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  </section>
);

export default HomeWhoWeAre;
