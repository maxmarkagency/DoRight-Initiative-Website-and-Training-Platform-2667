import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCalendar, FiClock, FiUsers, FiPlay, FiExternalLink, FiCheck } = FiIcons;

const Webinars = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  
  const upcomingWebinars = [
    { id: 1, title: 'Building Integrity in Local Government', description: 'Learn how citizens can engage with local government to promote transparency and accountability.', date: '2024-02-15', time: '2:00 PM WAT', duration: '90 minutes', speaker: 'Dr. Amina Hassan', attendees: 150, registrationUrl: '#', image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 2, title: 'Youth Leadership and Civic Engagement', description: 'Empowering young Nigerians to become effective leaders and change agents in their communities.', date: '2024-02-22', time: '4:00 PM WAT', duration: '75 minutes', speaker: 'Emmanuel Okafor', attendees: 200, registrationUrl: '#', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 3, title: 'Anti-Corruption Strategies for Communities', description: 'Practical approaches communities can use to identify, report, and prevent corruption.', date: '2024-03-01', time: '3:00 PM WAT', duration: '60 minutes', speaker: 'Prof. Kemi Adebayo', attendees: 180, registrationUrl: '#', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
  ];

  const pastWebinars = [
    { id: 4, title: 'Foundations of Ethical Leadership', description: 'Core principles every leader needs to build trust and drive positive change.', date: '2024-01-18', duration: '80 minutes', speaker: 'Dr. Funmi Olaniyan', views: 1250, recordingUrl: '#', image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 5, title: 'Community Mobilization for Change', description: 'How to organize and mobilize communities for effective advocacy and social change.', date: '2024-01-11', duration: '70 minutes', speaker: 'Chika Nwankwo', views: 980, recordingUrl: '#', image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 6, title: 'Digital Tools for Transparency', description: 'Leveraging technology to enhance government transparency and citizen participation.', date: '2024-01-04', duration: '65 minutes', speaker: 'Taiwo Adebisi', views: 1100, recordingUrl: '#', image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 7, title: 'Women in Leadership and Governance', description: 'Exploring the role of women in promoting good governance and ethical leadership.', date: '2023-12-21', duration: '85 minutes', speaker: 'Mrs. Blessing Okoro', views: 1400, recordingUrl: '#', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 8, title: 'Policy Advocacy: From Grassroots to Government', description: 'Strategic approaches to influencing policy change through effective advocacy.', date: '2023-12-14', duration: '75 minutes', speaker: 'Dr. Segun Adeyemi', views: 890, recordingUrl: '#', image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-600 text-white py-20">
        <div className="max-w-container mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-h1 font-heading font-bold mb-6 leading-tight"> Webinars </h1>
            <p className="text-xl text-neutral-300 leading-relaxed">
              Join our live events and access recorded sessions on integrity, governance, and civic engagement. Learn from experts and connect with like-minded individuals committed to positive change.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Upcoming Webinars */}
      <section className="py-20 bg-white">
        <div className="max-w-container mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-h2 font-heading font-bold text-neutral-900 mb-4"> Upcoming Webinars </h2>
            <p className="text-lg text-neutral-700 max-w-2xl mx-auto">
              Register for our upcoming sessions and be part of the conversation on building a more transparent and accountable Nigeria.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingWebinars.map((webinar, index) => (
              <motion.div
                key={webinar.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative">
                  <img src={webinar.image} alt={webinar.title} className="w-full h-48 object-cover" />
                  <div className="absolute top-4 left-4 bg-accent text-neutral-900 px-3 py-1 rounded-full text-sm font-semibold">
                    Upcoming
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-h4 font-heading font-bold text-neutral-900 mb-3">
                    {webinar.title}
                  </h3>
                  <p className="text-neutral-700 mb-4 leading-relaxed">
                    {webinar.description}
                  </p>
                  <div className="space-y-2 mb-4 text-sm text-neutral-600">
                    <div className="flex items-center">
                      <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-2" />
                      {formatDate(webinar.date)}
                    </div>
                    <div className="flex items-center">
                      <SafeIcon icon={FiClock} className="w-4 h-4 mr-2" />
                      {webinar.time} • {webinar.duration}
                    </div>
                    <div className="flex items-center">
                      <SafeIcon icon={FiUsers} className="w-4 h-4 mr-2" />
                      {webinar.attendees} registered
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-neutral-900">
                      Speaker: {webinar.speaker}
                    </p>
                  </div>
                  <button className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors">
                    Register Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Past Webinars */}
      <section className="py-20 bg-neutral-100">
        <div className="max-w-container mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-h2 font-heading font-bold text-neutral-900 mb-4"> Recorded Sessions </h2>
            <p className="text-lg text-neutral-700 max-w-2xl mx-auto">
              Catch up on our previous webinars and access valuable insights from our expert speakers and community discussions.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pastWebinars.map((webinar, index) => (
              <motion.div
                key={webinar.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <div className="relative">
                      <img src={webinar.image} alt={webinar.title} className="w-full h-48 md:h-full object-cover" />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <SafeIcon icon={FiPlay} className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="md:w-2/3 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-neutral-600">
                        {formatDate(webinar.date)}
                      </span>
                      <span className="text-sm text-neutral-600">
                        {webinar.views} views
                      </span>
                    </div>
                    <h3 className="text-h4 font-heading font-bold text-neutral-900 mb-3">
                      {webinar.title}
                    </h3>
                    <p className="text-neutral-700 mb-4 leading-relaxed">
                      {webinar.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-neutral-600 mb-4">
                      <div className="flex items-center">
                        <SafeIcon icon={FiClock} className="w-4 h-4 mr-1" />
                        {webinar.duration}
                      </div>
                      <span>by {webinar.speaker}</span>
                    </div>
                    <button className="w-full bg-neutral-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center">
                      <SafeIcon icon={FiPlay} className="mr-2 w-5 h-5" />
                      Watch Recording
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-container mx-auto px-5 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-h2 font-heading font-bold mb-6"> Stay Updated </h2>
            <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter to get notified about upcoming webinars, new courses, and important updates from the DoRight community.
            </p>
            <div className="max-w-md mx-auto">
              {!subscribed ? (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 px-4 py-3 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <button
                    type="submit"
                    className="bg-accent text-neutral-900 px-6 py-3 rounded-lg font-semibold hover:brightness-90 transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              ) : (
                <div className="bg-green-500/20 text-white p-4 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={FiCheck} className="w-6 h-6 mr-3" />
                  <span>Thank you for subscribing!</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Webinars;