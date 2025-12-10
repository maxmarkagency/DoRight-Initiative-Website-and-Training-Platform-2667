import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import ImageCarousel from '../components/ImageCarousel';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiTarget, FiTrendingUp, FiShield, FiArrowRight, FiPlay, FiStar, FiAward, FiGlobe } = FiIcons;

const Home = () => {
  const programs = [
    { title: 'Youth Mentorship', description: 'Empowering young leaders through mentorship and workshops for tomorrow\'s integrity champions.', icon: FiUsers, color: 'bg-accent' },
    { title: 'Community Campaigns', description: 'Local projects promoting accountability,transparency,and civic pride in communities.', icon: FiTarget, color: 'bg-accent' },
    { title: 'Policy Advocacy', description: 'Research-driven engagement with stakeholders to create systemic change and reform.', icon: FiTrendingUp, color: 'bg-accent' },
    { title: 'Monitoring & Reporting', description: 'Tools and platforms for citizens to report issues and ensure proper follow-up.', icon: FiShield, color: 'bg-accent' }
  ];

  const stats = [
    { number: '5,000+', label: 'Citizens Engaged' },
    { number: '50+', label: 'Communities Reached' },
    { number: '100+', label: 'Leaders Trained' },
    { number: '25+', label: 'Policy Changes' }
  ];

  const floatingElements = [
    { icon: FiStar, delay: 0, x: 20, y: -20 },
    { icon: FiAward, delay: 0.5, x: -30, y: 30 },
    { icon: FiGlobe, delay: 1, x: 40, y: 20 },
    { icon: FiTarget, delay: 1.5, x: -20, y: -30 }
  ];

  // Custom images for the hero carousel
  const heroImages = [
    { id: 1, src: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759570847937-Do-right-awarenss-initiative-school-project-6-scaled-2%20%281%29.jpg', alt: 'DRAI educator engaging with students in classroom', title: 'Empowering Education', description: 'Our dedicated educators work directly with students to promote integrity and civic responsibility in schools across Nigeria.' },
    { id: 2, src: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759570856796-Do-right-awarenss-initiative-school-project-6-scaled-2.jpg', alt: 'Students learning about integrity and civic responsibility', title: 'Building Future Leaders', description: 'Young Nigerians learning the principles of integrity,leadership,and community service in our comprehensive educational programs.' },
    { id: 3, src: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759570877162-Capture.PNG', alt: 'Group of students with DRAI educational materials', title: 'Community Impact', description: 'Students proudly displaying their commitment to DRAI principles and values,ready to make positive change in their communities.' }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen w-full overflow-x-hidden">
      {/* Enhanced Hero Section with Carousel */}
      <section className="relative bg-gradient-to-br from-primary via-neutral-800 to-black text-white py-12 sm:py-16 lg:py-20 xl:py-24 w-full overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div animate={{ background: ["radial-gradient(circle at 20% 80%,rgba(255,215,0,0.1) 0%,transparent 50%)", "radial-gradient(circle at 80% 20%,rgba(255,215,0,0.1) 0%,transparent 50%)", "radial-gradient(circle at 40% 40%,rgba(255,215,0,0.1) 0%,transparent 50%)"] }} transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }} className="absolute inset-0" />
          {/* Floating geometric shapes */}
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute top-1/4 right-1/4 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 border border-accent/20 rounded-full" />
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute bottom-1/4 left-1/4 w-12 h-12 sm:w-16 sm:h-16 lg:w-24 lg:h-24 border-2 border-white/10 rotate-45" />
          {/* Floating icons */}
          {floatingElements.map((element, index) => (
            <motion.div key={index} animate={{ y: [0, element.y, 0], x: [0, element.x, 0], opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 4, repeat: Infinity, delay: element.delay, ease: "easeInOut" }} className="absolute hidden lg:block" style={{ top: `${20 + index * 15}%`, right: `${10 + index * 20}%` }}>
              <SafeIcon icon={element.icon} className="w-6 h-6 lg:w-8 lg:h-8 text-accent/30" />
            </motion.div>
          ))}
        </div>

        <div className="relative w-full max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="text-center lg:text-left order-2 lg:order-1">
              {/* Badge */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 mb-4 sm:mb-6">
                <SafeIcon icon={FiStar} className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-accent" />
                <span className="text-xs sm:text-sm font-medium">Nigeria's Leading Integrity Initiative</span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-heading font-bold mb-4 sm:mb-6 leading-tight">
                Building a Nigeria That{' '}
                <motion.span animate={{ color: ['#FFD700', '#FFFFFF', '#FFD700'] }} transition={{ duration: 3, repeat: Infinity }} className="relative">
                  Does Right
                  <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1, delay: 1 }} className="absolute bottom-0 left-0 h-1 bg-accent rounded-full" />
                </motion.span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-neutral-300 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                <motion.span animate={{ opacity: [1, 0.7, 1] }} transition={{ duration: 2, repeat: Infinity }}> Empower. </motion.span>{' '}
                <motion.span animate={{ opacity: [1, 0.7, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}> Educate. </motion.span>{' '}
                <motion.span animate={{ opacity: [1, 0.7, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}> Transform. </motion.span>{' '}
                Join the movement to promote integrity,accountability,and civic responsibility across communities.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/join" className="bg-accent text-black px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:brightness-90 transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-xl text-sm sm:text-base w-full sm:w-auto">
                    Join The Movement
                    <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <SafeIcon icon={FiArrowRight} className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.div>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/training" className="border-2 border-white/80 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-white hover:text-black transition-all duration-300 inline-flex items-center justify-center backdrop-blur-sm text-sm sm:text-base w-full sm:w-auto">
                    <SafeIcon icon={FiPlay} className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Start Training
                  </Link>
                </motion.div>
              </motion.div>

              {/* Trust indicators */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1 }} className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm text-neutral-400">
                <div className="flex items-center">
                  <SafeIcon icon={FiUsers} className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span>5,000+ Active Members</span>
                </div>
                <div className="flex items-center">
                  <SafeIcon icon={FiAward} className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span>Certified Training Programs</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="relative w-full order-1 lg:order-2">
              <ImageCarousel images={heroImages} autoPlay={true} autoPlayInterval={6000} showControls={true} showIndicators={true} className="rounded-2xl shadow-2xl w-full" aspectRatio="4/3" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white w-full relative overflow-hidden">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.05 }} className="absolute inset-0 bg-gradient-to-r from-black/5 to-accent/5" />
        <div className="relative w-full max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-black mb-3 sm:mb-4"> Our Growing Impact </h2>
            <p className="text-sm sm:text-lg text-neutral-600 max-w-2xl mx-auto"> Real numbers,real change across Nigeria </p>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }} whileHover={{ scale: 1.05, y: -5 }} className="text-center group">
                <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: index * 0.1 + 0.3, type: "spring" }} className="bg-accent w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                  <SafeIcon icon={FiTrendingUp} className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-black" />
                </motion.div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: index * 0.1 + 0.5 }} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-1 sm:mb-2">
                  {stat.number}
                </motion.div>
                <div className="text-neutral-700 font-medium text-xs sm:text-sm lg:text-base"> {stat.label} </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced About Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-neutral-50 to-neutral-100 w-full relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/3 h-full">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute top-1/4 right-1/4 w-64 h-64 border border-black/10 rounded-full" />
        </div>
        <div className="relative w-full max-w-container mx-auto px-4 sm:px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-center lg:text-left">
              <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="inline-flex items-center bg-accent/20 rounded-full px-4 py-2 mb-6">
                <SafeIcon icon={FiUsers} className="w-5 h-5 mr-2 text-black" />
                <span className="text-black font-semibold">About DRAI</span>
              </motion.div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-black mb-6"> Who We Are </h2>
              <div className="space-y-6 text-base sm:text-lg text-neutral-700 leading-relaxed">
                <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }}>
                  Doing Right Awareness Initiative (DRAI) is a non-profit movement championing integrity,accountability,and civic responsibility across Nigeria. Through public campaigns,comprehensive training programs,and community-led action,we're building a culture where doing the right thing is the norm,not the exception.
                </motion.p>
                <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} viewport={{ once: true }}>
                  Our approach combines grassroots mobilization with evidence-based advocacy,creating sustainable change from the ground up while engaging with policy makers and institutions at the highest levels.
                </motion.p>
              </div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} viewport={{ once: true }} className="mt-8">
                <Link to="/programs" className="bg-black text-white px-8 py-4 rounded-xl font-semibold hover:bg-neutral-800 transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl">
                  Learn More About Our Work
                  <SafeIcon icon={FiArrowRight} className="ml-2 w-5 h-5" />
                </Link>
              </motion.div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }} className="relative w-full">
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }} className="relative">
                <img src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759575546536-DSC_0360-scaled-2-1536x1024.jpg" alt="DRAI team members working together" className="rounded-2xl shadow-2xl w-full h-auto" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                {/* Overlay with team info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <motion.h3 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} viewport={{ once: true }} className="text-xl md:text-2xl font-heading font-bold mb-2"> Our Dedicated Team </motion.h3>
                  <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} viewport={{ once: true }} className="text-sm md:text-base text-neutral-200 leading-relaxed">
                    Meet the passionate individuals behind DRAI's mission to promote integrity and civic responsibility across Nigerian communities.
                  </motion.p>
                </div>
              </motion.div>
              {/* Decorative elements */}
              <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-8 -left-8 w-16 h-16 bg-accent rounded-full opacity-80 hidden lg:block" />
              <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute -bottom-6 -right-6 w-24 h-24 bg-black/20 rounded-full hidden lg:block" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Programs Section */}
      <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-white w-full">
        <div className="w-full max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
            <motion.div initial={{ width: 0 }} whileInView={{ width: '4rem' }} transition={{ duration: 1, delay: 0.5 }} viewport={{ once: true }} className="h-1 bg-black mx-auto mb-4 sm:mb-6 rounded-full" />
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-black mb-4 sm:mb-6"> Our Programs </h2>
            <p className="text-sm sm:text-lg md:text-xl text-neutral-700 max-w-3xl mx-auto leading-relaxed">
              Comprehensive initiatives designed to create lasting change through education,advocacy,and community engagement.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {programs.map((program, index) => (
              <motion.div key={program.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} whileHover={{ y: -5 }} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 border border-neutral-200">
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ duration: 0.3 }} className={`${program.color} w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg`}>
                  <SafeIcon icon={program.icon} className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-black" />
                </motion.div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-heading font-bold text-black mb-3 sm:mb-4"> {program.title} </h3>
                <p className="text-neutral-700 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base"> {program.description} </p>
                <motion.div whileHover={{ x: 5 }} className="text-black font-semibold inline-flex items-center cursor-pointer text-sm sm:text-base">
                  Learn More
                  <SafeIcon icon={FiArrowRight} className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Training Promo Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-black via-neutral-800 to-neutral-900 w-full relative overflow-hidden">
        {/* Animated background */}
        <motion.div animate={{ background: ["radial-gradient(circle at 70% 30%,rgba(255,215,0,0.1) 0%,transparent 50%)", "radial-gradient(circle at 30% 70%,rgba(255,215,0,0.1) 0%,transparent 50%)"] }} transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }} className="absolute inset-0" />
        <div className="relative w-full max-w-container mx-auto px-4 sm:px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-white text-center lg:text-left">
              <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <SafeIcon icon={FiPlay} className="w-5 h-5 mr-2 text-accent" />
                <span className="text-accent font-semibold">Online Learning</span>
              </motion.div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold mb-6"> Learn Doing Right — Online Courses & Certification </h2>
              <p className="text-lg sm:text-xl mb-8 text-neutral-300 leading-relaxed">
                Enroll in our comprehensive step-by-step video courses. Complete lessons,pass assessments,earn verified certificates,and unlock advanced training modules in integrity and leadership.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/training" className="bg-accent text-black px-8 py-4 rounded-xl font-semibold hover:brightness-90 transition-all duration-300 inline-flex items-center justify-center shadow-lg">
                    Browse Courses
                    <SafeIcon icon={FiArrowRight} className="ml-2 w-5 h-5" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/training/dashboard" className="border-2 border-white/80 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-black transition-all duration-300 inline-flex items-center justify-center backdrop-blur-sm">
                    Training Dashboard
                  </Link>
                </motion.div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }} className="relative w-full">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative">
                <img src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759576809848-image_2025-10-04_041950413.png" alt="DRAI volunteer wearing orange volunteer t-shirt at community event" className="rounded-2xl shadow-2xl w-full h-auto" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl"></div>
                {/* Play button overlay */}
                <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.5, type: "spring" }} whileHover={{ scale: 1.1 }} className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center shadow-xl cursor-pointer">
                    <SafeIcon icon={FiPlay} className="w-8 h-8 text-black ml-1" />
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-neutral-100 via-white to-neutral-50 text-black w-full relative overflow-hidden">
        {/* Animated particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div key={i} animate={{ y: [0, -100, 0], opacity: [0, 1, 0] }} transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 5 }} className="absolute w-2 h-2 bg-accent/30 rounded-full" style={{ left: `${Math.random() * 100}%`, top: '100%' }} />
          ))}
        </div>
        <div className="relative w-full max-w-container mx-auto px-4 sm:px-5 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ duration: 0.8, type: "spring" }} viewport={{ once: true }} className="inline-flex items-center bg-accent/20 rounded-full px-6 py-3 mb-8">
              <SafeIcon icon={FiTarget} className="w-5 h-5 mr-2 text-black" />
              <span className="text-black font-semibold">Join the Movement</span>
            </motion.div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold mb-6"> Take Action Today </h2>
            <p className="text-lg sm:text-xl text-neutral-700 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join thousands of Nigerians committed to building a more transparent,accountable,and integrity-driven society. Every action counts toward creating the Nigeria we all deserve.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/join" className="bg-accent text-black px-10 py-5 rounded-xl font-semibold hover:brightness-90 transition-all duration-300 inline-flex items-center justify-center shadow-lg text-lg">
                  Donate Now
                  <SafeIcon icon={FiArrowRight} className="ml-2 w-6 h-6" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/join" className="border-2 border-black text-black px-10 py-5 rounded-xl font-semibold hover:bg-black hover:text-white transition-all duration-300 inline-flex items-center justify-center text-lg">
                  Volunteer
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;