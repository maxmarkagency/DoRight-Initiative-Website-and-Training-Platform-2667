import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner';

const { FiCalendar, FiClock, FiTarget, FiCheckCircle, FiChevronLeft, FiChevronRight, FiBookOpen, FiUsers, FiEdit3 } = FiIcons;

const StudentCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day

  // Mock events data
  const events = [
    {
      id: 1,
      title: 'Live Session: Ethics in Leadership',
      date: '2024-11-12',
      time: '14:00',
      type: 'live-session',
      description: 'Interactive session on applying ethical principles in leadership roles',
      duration: '2 hours',
      instructor: 'Dr. Amina Hassan'
    },
    {
      id: 2,
      title: 'Quiz: Integrity Assessment',
      date: '2024-11-15',
      time: '10:00',
      type: 'quiz',
      description: 'Assessment on understanding of core integrity principles',
      duration: '45 minutes',
      passingScore: '70%'
    },
    {
      id: 3,
      title: 'Assignment Due: Personal Ethics Plan',
      date: '2024-11-18',
      time: '23:59',
      type: 'assignment',
      description: 'Submit your personal ethics and integrity action plan',
      duration: 'N/A',
      submissionType: 'Document Upload'
    },
    {
      id: 4,
      title: 'Group Discussion: Community Leadership',
      date: '2024-11-20',
      time: '15:30',
      type: 'discussion',
      description: 'Collaborative discussion on effective community leadership strategies',
      duration: '1.5 hours',
      moderator: 'Dr. Amina Hassan'
    },
    {
      id: 5,
      title: 'Live Session: Anti-Corruption Strategies',
      date: '2024-11-22',
      time: '11:00',
      type: 'live-session',
      description: 'Practical approaches to fighting corruption and promoting transparency',
      duration: '2 hours',
      instructor: 'Prof. Ibrahim Musa'
    },
    {
      id: 6,
      title: 'Course Completion: Foundations of Integrity',
      date: '2024-11-25',
      time: '12:00',
      type: 'certificate',
      description: 'Certificate ceremony and celebration for course graduates',
      duration: '1 hour',
      location: 'Virtual Event'
    }
  ];

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  
  // Get events for specific date
  const getEventsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };
  
  // Get event type icon
  const getEventIcon = (type) => {
    switch (type) {
      case 'live-session': return FiUsers;
      case 'quiz': return FiTarget;
      case 'assignment': return FiEdit3;
      case 'discussion': return FiBookOpen;
      case 'certificate': return FiCheckCircle;
      default: return FiCalendar;
    }
  };
  
  // Get event type color
  const getEventColor = (type) => {
    switch (type) {
      case 'live-session': return 'text-blue-400 bg-blue-500/20';
      case 'quiz': return 'text-green-400 bg-green-500/20';
      case 'assignment': return 'text-yellow-400 bg-yellow-500/20';
      case 'discussion': return 'text-purple-400 bg-purple-500/20';
      case 'certificate': return 'text-accent bg-accent/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  // Navigate months
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  // Format month name
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const selectedDateEvents = getEventsForDate(selectedDate);
  const today = new Date();
  const isToday = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Learning Calendar</h1>
        <p className="text-gray-400">Your schedule and upcoming learning activities</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 p-6 rounded-xl"
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiChevronLeft} className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-2 bg-accent text-black rounded-lg font-semibold hover:brightness-90 transition-colors text-sm"
                >
                  Today
                </button>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <SafeIcon icon={FiChevronRight} className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {dayNames.map(day => (
                <div key={day} className="p-2 text-center text-sm font-semibold text-gray-400">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {generateCalendarDays().map((day, index) => {
                if (day === null) {
                  return <div key={index} className="p-2 h-12"></div>;
                }
                
                const date = new Date(currentYear, currentMonth, day);
                const dayEvents = getEventsForDate(date);
                const isSelected = selectedDate.toDateString() === date.toDateString();
                
                return (
                  <motion.button
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    className={`p-2 h-12 rounded-lg transition-colors relative ${
                      isSelected 
                        ? 'bg-accent text-black font-bold' 
                        : isToday(day)
                        ? 'bg-blue-500/20 text-blue-400 font-semibold'
                        : 'hover:bg-gray-700 text-white'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-sm">{day}</span>
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                        <div className="flex space-x-1">
                          {dayEvents.slice(0, 2).map((event, idx) => (
                            <div
                              key={idx}
                              className={`w-1.5 h-1.5 rounded-full ${
                                event.type === 'live-session' ? 'bg-blue-400' :
                                event.type === 'quiz' ? 'bg-green-400' :
                                event.type === 'assignment' ? 'bg-yellow-400' :
                                event.type === 'discussion' ? 'bg-purple-400' :
                                'bg-accent'
                              }`}
                            />
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-400">+{dayEvents.length - 2}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Selected Date Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 p-6 rounded-xl mb-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <div className="space-y-3">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event) => (
                  <div key={event.id} className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${getEventColor(event.type)}`}>
                        <SafeIcon icon={getEventIcon(event.type)} className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white text-sm">{event.title}</h4>
                        <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                          <SafeIcon icon={FiClock} className="w-3 h-3" />
                          <span>{event.time}</span>
                          {event.duration !== 'N/A' && <span>• {event.duration}</span>}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">{event.description}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <SafeIcon icon={FiCalendar} className="text-4xl text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No events scheduled</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Upcoming Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 p-6 rounded-xl"
          >
            <h3 className="text-lg font-bold text-white mb-4">Upcoming Events</h3>
            <div className="space-y-3">
              {events
                .filter(event => new Date(event.date) >= new Date())
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 5)
                .map((event) => (
                  <div key={event.id} className="p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className={`p-1.5 rounded-full ${getEventColor(event.type)}`}>
                        <SafeIcon icon={getEventIcon(event.type)} className="w-3 h-3" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white text-sm">{event.title}</h4>
                        <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                          <SafeIcon icon={FiCalendar} className="w-3 h-3" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                          <SafeIcon icon={FiClock} className="w-3 h-3 ml-1" />
                          <span>{event.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudentCalendar;