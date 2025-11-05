import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiHeart, FiHandshake, FiCheck, FiArrowRight, FiMail, FiPhone, FiMapPin } = FiIcons;

const Join = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', interest: '', message: '' });
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

  const ways = [
    { title: 'Volunteer', description: 'Join our community of dedicated volunteers working on the ground to promote integrity and accountability.', features: ['Community outreach programs', 'Event organization support', 'Training and mentorship', 'Flexible time commitment', 'Skills development opportunities'], icon: FiUsers, color: 'from-primary to-primary-600', ctaText: 'Become a Volunteer' },
    { title: 'Donate', description: 'Support our mission with financial contributions that help us expand our reach and impact across Nigeria.', features: ['Monthly or one-time donations', 'Transparent fund allocation', 'Regular impact reports', 'Tax-deductible receipts', 'Direct community impact'], icon: FiHeart, color: 'bg-accent', ctaText: 'Make a Donation' },
    { title: 'Partner', description: 'Collaborate with us as an organization,institution,or business to amplify our collective impact.', features: ['Strategic partnerships', 'Joint program development', 'Resource sharing', 'Co-branded initiatives', 'Network expansion'], icon: FiHandshake, color: 'from-primary to-primary-600', ctaText: 'Partner With Us' }
  ];

  const interestOptions = ['Volunteering', 'Donating', 'Partnership', 'Youth Programs', 'Community Campaigns', 'Policy Advocacy', 'Training Programs', 'Other'];

  const stats = [
    { number: '500+', label: 'Active Volunteers' },
    { number: '₦50M+', label: 'Funds Raised' },
    { number: '25+', label: 'Partner Organizations' },
    { number: '100+', label: 'Communities Impacted' }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-600 text-white py-20">
        <div className="max-w-container mx-auto px-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-4xl mx-auto">
            <h1 className="text-h1 font-heading font-bold mb-6 leading-tight"> Join the Movement </h1>
            <p className="text-xl text-neutral-300 leading-relaxed"> Become part of a growing community of Nigerians committed to building a more transparent,accountable,and integrity-driven society. Together,we can create lasting change. </p>
          </motion.div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-container mx-auto px-5">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-h2 font-heading font-bold text-neutral-900 mb-4"> Our Growing Impact </h2>
            <p className="text-lg text-neutral-700 max-w-2xl mx-auto"> See how our community is making a difference across Nigeria </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2"> {stat.number} </div>
                <div className="text-neutral-700 font-medium"> {stat.label} </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ways to Join */}
      <section className="py-20 bg-neutral-100">
        <div className="max-w-container mx-auto px-5">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-h2 font-heading font-bold text-neutral-900 mb-4"> Ways to Get Involved </h2>
            <p className="text-lg text-neutral-700 max-w-2xl mx-auto"> Choose how you'd like to contribute to building a better Nigeria. Every form of support makes a meaningful difference. </p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {ways.map((way, index) => (
              <motion.div key={way.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className={` p-6 ${way.color.startsWith('from-') ? 'bg-gradient-to-r' : ''} ${way.color}`}>
                  <SafeIcon icon={way.icon} className={`w-12 h-12 ${way.title === 'Donate' ? 'text-neutral-900' : 'text-white'} mb-4`} />
                  <h3 className={`text-h3 font-heading font-bold ${way.title === 'Donate' ? 'text-neutral-900' : 'text-white'} mb-2`}> {way.title} </h3>
                </div>
                <div className="p-6">
                  <p className="text-neutral-700 mb-6 leading-relaxed"> {way.description} </p>
                  <div className="space-y-3 mb-8">
                    {way.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <SafeIcon icon={FiCheck} className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                        <span className="text-neutral-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <button className={`w-full ${way.title === 'Donate' ? 'bg-accent text-neutral-900 hover:brightness-90' : 'bg-primary text-white hover:bg-primary-600'} px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center`}>
                    {way.ctaText}
                    <SafeIcon icon={FiArrowRight} className="ml-2 w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-white">
        <div className="max-w-container mx-auto px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Form */}
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
              <h2 className="text-h2 font-heading font-bold text-neutral-900 mb-6"> Get Started Today </h2>
              <p className="text-lg text-neutral-700 mb-8 leading-relaxed"> Ready to join us? Fill out the form below and we'll get in touch to discuss how you can best contribute to our mission. </p>
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2"> Full Name * </label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2"> Email Address * </label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2"> Phone Number </label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <div>
                    <label htmlFor="interest" className="block text-sm font-medium text-neutral-700 mb-2"> Area of Interest * </label>
                    <select id="interest" name="interest" value={formData.interest} onChange={handleInputChange} required className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                      <option value="">Select an option</option>
                      {interestOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-2"> Message </label>
                    <textarea id="message" name="message" rows={4} value={formData.message} onChange={handleInputChange} placeholder="Tell us more about your interest and how you'd like to get involved..." className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                  </div>
                  <button type="submit" className="w-full bg-primary text-white px-6 py-4 rounded-lg font-semibold hover:bg-primary-600 transition-colors"> Submit Application </button>
                </form>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-accent/10 border border-accent/20 rounded-lg p-6 text-center">
                  <SafeIcon icon={FiCheck} className="w-12 h-12 text-accent mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-neutral-900 mb-2"> Thank You! </h3>
                  <p className="text-neutral-700"> We've received your application and will get back to you within 48 hours. </p>
                </motion.div>
              )}
            </motion.div>
            {/* Contact Info */}
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }} className="bg-neutral-50 rounded-lg p-8">
              <h3 className="text-h3 font-heading font-bold text-neutral-900 mb-6"> Contact Information </h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <SafeIcon icon={FiMail} className="w-6 h-6 text-primary mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1">Email Us</h4>
                    <p className="text-neutral-700">info@doright.ng</p>
                    <p className="text-neutral-700">volunteer@doright.ng</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <SafeIcon icon={FiPhone} className="w-6 h-6 text-primary mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1">Call Us</h4>
                    <p className="text-neutral-700">+234 (0) 123 456 7890</p>
                    <p className="text-neutral-700">+234 (0) 987 654 3210</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <SafeIcon icon={FiMapPin} className="w-6 h-6 text-primary mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-1">Visit Us</h4>
                    <p className="text-neutral-700"> DoRight Awareness Initiative<br /> 123 Integrity Street<br /> Victoria Island,Lagos<br /> Nigeria </p>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-neutral-200">
                <h4 className="font-semibold text-neutral-900 mb-4"> Office Hours </h4>
                <div className="space-y-2 text-neutral-700">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday: 10:00 AM - 2:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-600 text-white">
        <div className="max-w-container mx-auto px-5 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <h2 className="text-h2 font-heading font-bold mb-6"> Every Action Counts </h2>
            <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto"> Whether you volunteer an hour a week or donate monthly,your contribution helps build a Nigeria where integrity thrives. </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-accent text-neutral-900 px-8 py-4 rounded-lg font-semibold hover:brightness-90 transition-colors inline-flex items-center justify-center">
                Start Volunteering
                <SafeIcon icon={FiArrowRight} className="ml-2 w-5 h-5" />
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors inline-flex items-center justify-center"> Make a Donation </button>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Join;