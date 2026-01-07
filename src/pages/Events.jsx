import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import supabase from '../lib/supabase';

const { FiCalendar, FiMapPin, FiUsers } = FiIcons;

const Events = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5,
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_published', true)
        .gte('start_date', now)
        .order('start_date', { ascending: true });

      if (error) throw error;
      setUpcomingEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="bg-gray-900 text-white min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-yellow-400 sm:text-5xl lg:text-6xl">
            Our Events
          </h1>
          <p className="mt-4 text-xl text-gray-300">
            Join us for our upcoming events and be part of the change.
          </p>
        </div>

        <div className="mt-20">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Upcoming Events</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
              <p className="mt-4 text-gray-300">Loading events...</p>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No upcoming events at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="grid gap-10 md:grid-cols-2">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  className="bg-gray-800 rounded-lg shadow-xl overflow-hidden"
                  whileHover={{ scale: 1.03, boxShadow: '0px 10px 30px rgba(251, 191, 36, 0.2)' }}
                  transition={{ duration: 0.3 }}
                >
                  {event.image_url && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-yellow-400">{event.title}</h3>
                    <div className="flex items-center mt-4 text-gray-400">
                      <SafeIcon icon={FiCalendar} className="h-5 w-5 mr-3" />
                      <span>{formatDate(event.start_date || event.event_date)}</span>
                    </div>
                    <div className="flex items-center mt-2 text-gray-400">
                      <SafeIcon icon={FiMapPin} className="h-5 w-5 mr-3" />
                      <span>{event.location}</span>
                    </div>
                    {event.event_type && (
                      <div className="mt-2">
                        <span className="inline-block bg-yellow-400 text-black text-xs font-semibold px-3 py-1 rounded-full">
                          {event.event_type}
                        </span>
                      </div>
                    )}
                    {event.max_attendees && (
                      <div className="flex items-center mt-2 text-gray-400">
                        <SafeIcon icon={FiUsers} className="h-5 w-5 mr-3" />
                        <span>Max {event.max_attendees} attendees</span>
                      </div>
                    )}
                    <p className="mt-6 text-gray-300">{event.description}</p>
                    {event.organizer && (
                      <p className="mt-3 text-sm text-gray-400">
                        Organized by: {event.organizer}
                      </p>
                    )}
                    <a
                      href={event.registration_link || '#'}
                      target={event.registration_link ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      className="mt-8 bg-yellow-400 text-black font-bold py-3 px-6 rounded-lg hover:bg-yellow-500 transition-colors duration-300 w-full sm:w-auto inline-block text-center"
                    >
                      Learn More & Register
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Events;