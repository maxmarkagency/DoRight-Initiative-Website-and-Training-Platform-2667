import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCalendar, FiMapPin } = FiIcons;

const Events = () => {
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

  const upcomingEvents = [
    {
      title: 'Annual Leadership Summit 2024',
      date: 'October 26, 2024',
      location: 'Lagos, Nigeria',
      description: 'A gathering of leaders to discuss the future of ethical governance and civic engagement in Africa.',
    },
    {
      title: 'Youth Integrity Workshop',
      date: 'November 15, 2024',
      location: 'Online Webinar',
      description: 'An interactive workshop for young leaders on the importance of integrity and anti-corruption.',
    },
  ];

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
          <div className="grid gap-10 md:grid-cols-2">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={index}
                className="bg-gray-800 rounded-lg shadow-xl overflow-hidden"
                whileHover={{ scale: 1.03, boxShadow: '0px 10px 30px rgba(251, 191, 36, 0.2)' }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-yellow-400">{event.title}</h3>
                  <div className="flex items-center mt-4 text-gray-400">
                    <SafeIcon icon={FiCalendar} className="h-5 w-5 mr-3" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center mt-2 text-gray-400">
                    <SafeIcon icon={FiMapPin} className="h-5 w-5 mr-3" />
                    <span>{event.location}</span>
                  </div>
                  <p className="mt-6 text-gray-300">{event.description}</p>
                  <button className="mt-8 bg-yellow-400 text-black font-bold py-3 px-6 rounded-lg hover:bg-yellow-500 transition-colors duration-300 w-full sm:w-auto">
                    Learn More & Register
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Events;