import React from 'react';
import { motion } from 'framer-motion';

const ContactFaq = ({ heading, text, faqs = [] }) => (
  <section className="py-12 sm:py-16 lg:py-20 bg-neutral-100">
    <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-3 sm:mb-4"> {heading} </h2>
        <p className="text-sm sm:text-lg text-neutral-700 max-w-2xl mx-auto"> {text} </p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
        {faqs.map((faq, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} className="bg-white rounded-lg border border-neutral-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-heading font-bold text-neutral-900 mb-3"> {faq.question} </h3>
            <p className="text-sm sm:text-base text-neutral-700 leading-relaxed"> {faq.answer} </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ContactFaq;
