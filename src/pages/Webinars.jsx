import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../lib/supabase';

const { FiCalendar, FiClock, FiUsers, FiPlay, FiExternalLink, FiCheck } = FiIcons;

const Webinars = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [upcomingWebinars, setUpcomingWebinars] = useState([]);
  const [pastWebinars, setPastWebinars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWebinars();
  }, []);

  const fetchWebinars = async () => {
    try {
      setLoading(true);
      const now = new Date().toISOString();

      const { data: upcoming, error: upcomingError } = await supabase
        .from('webinars')
        .select('*')
        .eq('is_published', true)
        .gte('date', now)
        .order('date', { ascending: true });

      if (upcomingError) throw upcomingError;

      const { data: past, error: pastError } = await supabase
        .from('webinars')
        .select('*')
        .eq('is_published', true)
        .lt('date', now)
        .order('date', { ascending: false })
        .limit(5);

      if (pastError) throw pastError;

      setUpcomingWebinars(upcoming || []);
      setPastWebinars(past || []);
    } catch (error) {
      console.error('Error fetching webinars:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}min` : `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${minutes} minutes`;
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
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-neutral-600">Loading webinars...</p>
            </div>
          ) : upcomingWebinars.length === 0 ? (
            <div className="text-center py-12 text-neutral-600">
              <p>No upcoming webinars at the moment. Check back soon!</p>
            </div>
          ) : (
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
                    <img
                      src={webinar.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                      alt={webinar.title}
                      className="w-full h-48 object-cover"
                    />
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
                        {formatTime(webinar.date)} • {formatDuration(webinar.duration_minutes)}
                      </div>
                      {webinar.max_participants && (
                        <div className="flex items-center">
                          <SafeIcon icon={FiUsers} className="w-4 h-4 mr-2" />
                          Max {webinar.max_participants} participants
                        </div>
                      )}
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium text-neutral-900">
                        Speaker: {webinar.presenter}
                      </p>
                    </div>
                    <a
                      href={webinar.registration_link || '#'}
                      target={webinar.registration_link ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      className="block w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors text-center"
                    >
                      Register Now
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
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
{loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-neutral-600">Loading recordings...</p>
            </div>
          ) : pastWebinars.length === 0 ? (
            <div className="text-center py-12 text-neutral-600">
              <p>No recorded sessions available yet.</p>
            </div>
          ) : (
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
                        <img
                          src={webinar.image_url || 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                          alt={webinar.title}
                          className="w-full h-48 md:h-full object-cover"
                        />
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
                          {formatDuration(webinar.duration_minutes)}
                        </div>
                        <span>by {webinar.presenter}</span>
                      </div>
                      <a
                        href={webinar.meeting_link || '#'}
                        target={webinar.meeting_link ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        className="w-full bg-neutral-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center"
                      >
                        <SafeIcon icon={FiPlay} className="mr-2 w-5 h-5" />
                        Watch Recording
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
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