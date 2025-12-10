import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMail, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiSend, FiCheck } = FiIcons;

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
  };

  const contactInfo = [
    { icon: FiMail, title: 'Email Us', details: ['info@doright.ng', 'support@doright.ng'], color: 'text-primary' },
    { icon: FiMapPin, title: 'Visit Us', details: ['DoRight Awareness Initiative', '28b, Olaminuyun street , Parkview', 'Lagos, Nigeria 101233'], color: 'text-primary' }
  ];

  const departments = [
    { name: 'General Inquiries', email: 'info@doright.ng', description: 'General questions about our organization and programs' },
    { name: 'Partnerships', email: 'partnerships@doright.ng', description: 'Collaboration opportunities and strategic partnerships' },
    { name: 'Volunteer Coordination', email: 'volunteer@doright.ng', description: 'Volunteer opportunities and community engagement' },
    { name: 'Training Programs', email: 'training@doright.ng', description: 'Course inquiries and certification support' },
    { name: 'Media & Press', email: 'media@doright.ng', description: 'Press inquiries and media relations' }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-600 text-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 sm:mb-6 leading-tight"> Get in Touch </h1>
            <p className="text-base sm:text-lg md:text-xl text-neutral-300 leading-relaxed"> We'd love to hear from you. Whether you have questions about our programs,want to get involved,or need support,we're here to help. </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-3 sm:mb-4"> Contact Information </h2>
            <p className="text-sm sm:text-lg text-neutral-700 max-w-2xl mx-auto"> Multiple ways to reach us. Choose the method that works best for you. </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
            {contactInfo.map((info, index) => (
              <motion.div key={info.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} className="text-center">
                <div className={`${info.color} w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-4 sm:mb-6 bg-neutral-100 rounded-full flex items-center justify-center`}>
                  <SafeIcon icon={info.icon} className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-heading font-bold text-neutral-900 mb-3 sm:mb-4"> {info.title} </h3>
                <div className="space-y-1 sm:space-y-2">
                  {info.details.map((detail, detailIndex) => (
                    <p key={detailIndex} className="text-sm sm:text-base text-neutral-700"> {detail} </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Departments */}
      <section className="py-12 sm:py-16 lg:py-20 bg-neutral-100">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Form */}
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-neutral-900 mb-4 sm:mb-6"> Send Us a Message </h2>
              <p className="text-sm sm:text-base text-neutral-700 mb-6 sm:mb-8"> Have a specific question or need assistance? Fill out the form below and we'll get back to you as soon as possible. </p>
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2"> Full Name * </label>
                      <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2"> Email Address * </label>
                      <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 mb-2"> Subject * </label>
                    <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleInputChange} required className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base" />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-2"> Message * </label>
                    <textarea id="message" name="message" rows={5} value={formData.message} onChange={handleInputChange} required placeholder="Please provide as much detail as possible..." className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base" />
                  </div>
                  <button type="submit" className="w-full bg-primary text-white px-6 py-3 sm:py-4 rounded-lg font-semibold hover:bg-primary-600 transition-colors inline-flex items-center justify-center text-sm sm:text-base">
                    <SafeIcon icon={FiSend} className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Send Message
                  </button>
                </form>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-accent/10 border border-accent/20 rounded-lg p-6 text-center">
                  <SafeIcon icon={FiCheck} className="w-10 h-10 sm:w-12 sm:h-12 text-accent mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2"> Message Sent! </h3>
                  <p className="text-sm sm:text-base text-neutral-700"> Thank you for reaching out. We'll respond to your message within 24 hours. </p>
                </motion.div>
              )}
            </motion.div>
            {/* Departments */}
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }}>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-neutral-900 mb-4 sm:mb-6"> Department Contacts </h2>
              <p className="text-sm sm:text-base text-neutral-700 mb-6 sm:mb-8"> For specific inquiries,you can reach out directly to the relevant department. </p>
              <div className="space-y-4 sm:space-y-6">
                {departments.map((dept, index) => (
                  <motion.div key={dept.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-lg sm:text-xl font-heading font-bold text-neutral-900 mb-2"> {dept.name} </h3>
                    <p className="text-neutral-600 mb-3 text-sm sm:text-base"> {dept.description} </p>
                    <a href={`mailto:${dept.email}`} className="text-primary hover:text-primary-600 font-medium inline-flex items-center text-sm sm:text-base">
                      <SafeIcon icon={FiMail} className="mr-2 w-4 h-4" /> {dept.email}
                    </a>
                  </motion.div>
                ))}
              </div>
              {/* Social Media */}
              <div className="mt-8 sm:mt-12">
                <h3 className="text-lg sm:text-xl font-heading font-bold text-neutral-900 mb-4 sm:mb-6"> Follow Us </h3>
                <div className="flex space-x-3 sm:space-x-4">
                  {[{ icon: FiFacebook, href: '#', label: 'Facebook' }, { icon: FiTwitter, href: '#', label: 'Twitter' }, { icon: FiInstagram, href: '#', label: 'Instagram' }, { icon: FiLinkedin, href: '#', label: 'LinkedIn' }].map((social) => (
                    <a key={social.label} href={social.href} aria-label={social.label} className="w-10 h-10 sm:w-12 sm:h-12 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                      <SafeIcon icon={social.icon} className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-3 sm:mb-4"> Find Us </h2>
            <p className="text-sm sm:text-lg text-neutral-700 max-w-2xl mx-auto"> Located in the heart of Lagos,our office is easily accessible by public transport. </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }} className="bg-neutral-200 rounded-lg h-64 sm:h-80 lg:h-96 flex items-center justify-center">
            <div className="text-center p-4">
              <SafeIcon icon={FiMapPin} className="w-12 h-12 sm:w-16 sm:h-16 text-neutral-500 mx-auto mb-3 sm:mb-4" />
              <p className="text-neutral-600 text-base sm:text-lg font-medium"> Interactive Map Would Be Here </p>
              <p className="text-neutral-500 text-sm sm:text-base"> Integration with Google Maps or similar service </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-neutral-100">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-3 sm:mb-4"> Frequently Asked Questions </h2>
            <p className="text-sm sm:text-lg text-neutral-700 max-w-2xl mx-auto"> Quick answers to common questions about our organization and programs. </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {[{ question: 'How can I volunteer with DoRight?', answer: 'You can apply to volunteer through our Join page or contact our volunteer coordinator directly. We offer flexible opportunities that match your skills and availability.' }, { question: 'Are your training courses free?', answer: 'Yes,all our training courses and certification programs are completely free. Our goal is to make integrity education accessible to all Nigerians.' }, { question: 'How do I report corruption or misconduct?', answer: 'You can use our anonymous reporting hotline or digital platform. All reports are handled confidentially and with appropriate follow-up.' }, { question: 'Can my organization partner with DoRight?', answer: 'We welcome partnerships with organizations that share our values. Contact our partnerships team to discuss collaboration opportunities.' }].map((faq, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-heading font-bold text-neutral-900 mb-3"> {faq.question} </h3>
                <p className="text-sm sm:text-base text-neutral-700 leading-relaxed"> {faq.answer} </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Contact;