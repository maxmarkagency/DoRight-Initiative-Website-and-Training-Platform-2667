import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiTarget, FiTrendingUp, FiShield, FiArrowRight, FiPlay, FiPause, FiStar, FiChevronLeft, FiChevronRight } = FiIcons;

const Home = () => {
  const programs = [
    { title: 'Youth Mentorship', description: "Empowering young leaders through mentorship and workshops for tomorrow's integrity champions.", icon: FiUsers },
    { title: 'Community Campaigns', description: 'Local projects promoting accountability, transparency, and civic pride in communities.', icon: FiTarget },
    { title: 'Policy Advocacy', description: 'Research-driven engagement with stakeholders to create systemic change and reform.', icon: FiTrendingUp },
    { title: 'Monitoring & Reporting', description: 'Tools and platforms for citizens to report issues and ensure proper follow-up.', icon: FiShield }
  ];

  // Hero slides: each pairs one background photo with its own message.
  const heroSlides = [
    {
      id: 1,
      src: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759570847937-Do-right-awarenss-initiative-school-project-6-scaled-2%20%281%29.jpg',
      alt: 'DRAI educator engaging with students in classroom',
      badge: 'Promoting Integrity & Civic Responsibility',
      headline: 'Building a Nigeria That',
      headlineAccent: 'Does Right',
      subtext: 'Empower. Educate. Transform. Join the movement to promote integrity, accountability, and civic responsibility across communities.'
    },
    {
      id: 2,
      src: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759570856796-Do-right-awarenss-initiative-school-project-6-scaled-2.jpg',
      alt: 'Students learning about integrity and civic responsibility',
      badge: 'Youth Mentorship',
      headline: 'Empowering',
      headlineAccent: "Tomorrow's Leaders",
      subtext: 'We mentor young Nigerians through workshops and hands-on programs that build the confidence and skills to lead with integrity.'
    },
    {
      id: 3,
      src: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759570877162-Capture.PNG',
      alt: 'Group of students with DRAI educational materials',
      badge: 'Community-Led Change',
      headline: 'Communities Driving Their',
      headlineAccent: 'Own Transformation',
      subtext: 'From grassroots campaigns to policy advocacy, real change starts with the people closest to the problem.'
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setSlideDirection(1);
      setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
    }, 7000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, heroSlides.length]);

  const goToSlide = (index) => {
    setSlideDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const goToPrevSlide = () => {
    setSlideDirection(-1);
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  const goToNextSlide = () => {
    setSlideDirection(1);
    setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
  };

  const slideVariants = {
    enter: (direction) => ({ opacity: 0, scale: direction === 0 ? 1 : 1.05 }),
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1 }
  };

  const slide = heroSlides[currentSlide];

  return (
    <MotionConfig reducedMotion="user">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen w-full overflow-x-hidden">
        {/* Hero Slider — full-bleed background photos, distinct message per slide */}
        <section className="relative text-white w-full overflow-hidden min-h-[640px] sm:min-h-[760px] lg:min-h-[880px] flex items-center">
          <AnimatePresence initial={false} custom={slideDirection} mode="sync">
            <motion.div
              key={slide.id}
              custom={slideDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.8 }}
              className="absolute inset-0 w-full h-full"
            >
              <img src={slide.src} alt={slide.alt} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20" />
            </motion.div>
          </AnimatePresence>

          <div className="relative z-10 w-full max-w-container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="inline-flex items-center bg-accent text-black rounded-full px-3 sm:px-4 py-2 mb-4 sm:mb-6">
                    <SafeIcon icon={FiStar} className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    <span className="text-xs sm:text-sm font-medium">{slide.badge}</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-heading font-bold mb-4 sm:mb-6 leading-tight text-balance">
                    {slide.headline} <span className="text-accent">{slide.headlineAccent}</span>
                  </h1>

                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-neutral-200 leading-relaxed">
                    {slide.subtext}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/join" className="bg-accent text-black px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:brightness-90 transition-all duration-300 inline-flex items-center justify-center text-sm sm:text-base w-full sm:w-auto">
                    Join The Movement
                    <SafeIcon icon={FiArrowRight} className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/training" className="border-2 border-white/80 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-white hover:text-black transition-all duration-300 inline-flex items-center justify-center text-sm sm:text-base w-full sm:w-auto">
                    <SafeIcon icon={FiPlay} className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                    Start Training
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Slide controls */}
          {heroSlides.length > 1 && (
            <>
              <button
                onClick={goToPrevSlide}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 sm:p-3 rounded-full transition-colors z-10"
                aria-label="Previous slide"
              >
                <SafeIcon icon={FiChevronLeft} className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={goToNextSlide}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 sm:p-3 rounded-full transition-colors z-10"
                aria-label="Next slide"
              >
                <SafeIcon icon={FiChevronRight} className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                {heroSlides.map((s, index) => (
                  <button
                    key={s.id}
                    onClick={() => goToSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'w-8 bg-accent' : 'w-2 bg-white/50 hover:bg-white/70'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setIsAutoPlaying((p) => !p)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-colors z-10"
                aria-label={isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'}
              >
                <SafeIcon icon={isAutoPlaying ? FiPause : FiPlay} className="w-4 h-4" />
              </button>
            </>
          )}
        </section>

        {/* About Section */}
        <section className="py-16 sm:py-24 bg-neutral-50 w-full relative overflow-hidden">
          <div className="relative w-full max-w-container mx-auto px-4 sm:px-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-black mb-6">Who We Are</h2>
                <div className="space-y-6 text-base sm:text-lg text-neutral-700 leading-relaxed">
                  <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }}>
                    Doing Right Awareness Initiative (DRAI) is a non-profit movement championing integrity, accountability, and civic responsibility across Nigeria. Through public campaigns, comprehensive training programs, and community-led action, we're building a culture where doing the right thing is the norm, not the exception.
                  </motion.p>
                  <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} viewport={{ once: true }}>
                    Our approach combines grassroots mobilization with evidence-based advocacy, creating sustainable change from the ground up while engaging with policy makers and institutions at the highest levels.
                  </motion.p>
                </div>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} viewport={{ once: true }} className="mt-8">
                  <Link to="/programs" className="bg-black text-white px-8 py-4 rounded-lg font-semibold hover:bg-neutral-800 transition-all duration-300 inline-flex items-center">
                    Learn More About Our Work
                    <SafeIcon icon={FiArrowRight} className="ml-2 w-5 h-5" />
                  </Link>
                </motion.div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }} className="relative w-full">
                <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }} className="relative">
                  <img src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759575546536-DSC_0360-scaled-2-1536x1024.jpg" alt="DRAI team members working together" className="rounded-lg w-full h-auto" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-xl md:text-2xl font-heading font-bold mb-2">Our Dedicated Team</h3>
                    <p className="text-sm md:text-base text-neutral-200 leading-relaxed">
                      Meet the passionate individuals behind DRAI's mission to promote integrity and civic responsibility across Nigerian communities.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Programs Section */}
        <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-white w-full">
          <div className="w-full max-w-container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-black mb-4 sm:mb-6">Our Programs</h2>
              <p className="text-sm sm:text-lg md:text-xl text-neutral-700 max-w-3xl mx-auto leading-relaxed">
                Comprehensive initiatives designed to create lasting change through education, advocacy, and community engagement.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {programs.map((program, index) => (
                <motion.div key={program.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} whileHover={{ y: -5 }} className="bg-white rounded-lg p-6 sm:p-8 border border-neutral-200 hover:shadow-[0_4px_12px_rgba(13,14,22,0.15)] transition-shadow duration-300 flex flex-col h-full">
                  <div className="bg-primary w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg flex items-center justify-center mb-4 sm:mb-6 flex-shrink-0">
                    <SafeIcon icon={program.icon} className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-accent" />
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-heading font-bold text-black mb-3 sm:mb-4">{program.title}</h3>
                  <p className="text-neutral-700 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base flex-grow break-words">{program.description}</p>
                  <Link to="/programs" className="text-black font-semibold inline-flex items-center text-sm sm:text-base mt-auto hover:text-accent transition-colors">
                    Learn More
                    <SafeIcon icon={FiArrowRight} className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Training Promo Section */}
        <section className="py-16 sm:py-24 bg-primary w-full relative overflow-hidden">
          <div className="relative w-full max-w-container mx-auto px-4 sm:px-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="text-white text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold mb-6">Learn Doing Right — Online Courses &amp; Certification</h2>
                <p className="text-lg sm:text-xl mb-8 text-neutral-300 leading-relaxed">
                  Enroll in our comprehensive step-by-step video courses. Complete lessons, pass assessments, earn verified certificates, and unlock advanced training modules in integrity and leadership.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/training" className="bg-accent text-black px-8 py-4 rounded-lg font-semibold hover:brightness-90 transition-all duration-300 inline-flex items-center justify-center">
                      <SafeIcon icon={FiPlay} className="mr-2 w-5 h-5" />
                      Browse Courses
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/training/dashboard" className="border-2 border-white/80 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-black transition-all duration-300 inline-flex items-center justify-center">
                      Training Dashboard
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }} className="relative w-full">
                <img src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759576809848-image_2025-10-04_041950413.png" alt="DRAI volunteer wearing orange volunteer t-shirt at community event" className="rounded-lg w-full h-auto" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 sm:py-24 bg-white text-black w-full relative overflow-hidden">
          <div className="relative w-full max-w-container mx-auto px-4 sm:px-5 text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold mb-6">Take Action Today</h2>
              <p className="text-lg sm:text-xl text-neutral-700 mb-10 max-w-3xl mx-auto leading-relaxed">
                Be part of building a more transparent, accountable, and integrity-driven Nigeria. Every action counts toward the change we're working to create.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/join" className="bg-accent text-black px-10 py-5 rounded-lg font-semibold hover:brightness-90 transition-all duration-300 inline-flex items-center justify-center text-lg">
                    Join The Movement
                    <SafeIcon icon={FiArrowRight} className="ml-2 w-6 h-6" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/contact" className="border-2 border-black text-black px-10 py-5 rounded-lg font-semibold hover:bg-black hover:text-white transition-all duration-300 inline-flex items-center justify-center text-lg">
                    Partner With Us
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </motion.div>
    </MotionConfig>
  );
};

export default Home;
