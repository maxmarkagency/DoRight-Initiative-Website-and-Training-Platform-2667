import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../../common/SafeIcon';
import { FiArrowRight, FiPlay, FiPause, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ButtonLink from '../ButtonLink';

const AUTOPLAY_MS = 7000;

const slideVariants = {
  enter: (direction) => ({ opacity: 0, scale: direction === 0 ? 1 : 1.05 }),
  center: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1 },
};

const HomeHero = ({ slides = [], primaryButton, secondaryButton }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const count = slides.length;
  const index = count ? Math.min(currentSlide, count - 1) : 0;

  useEffect(() => {
    if (!isAutoPlaying || count <= 1) return undefined;
    const interval = setInterval(() => {
      setSlideDirection(1);
      setCurrentSlide((prev) => (prev >= count - 1 ? 0 : prev + 1));
    }, AUTOPLAY_MS);
    return () => clearInterval(interval);
  }, [isAutoPlaying, count]);

  const goToSlide = (next) => {
    setSlideDirection(next > index ? 1 : -1);
    setCurrentSlide(next);
  };
  const goToPrevSlide = () => {
    setSlideDirection(-1);
    setCurrentSlide(index === 0 ? count - 1 : index - 1);
  };
  const goToNextSlide = () => {
    setSlideDirection(1);
    setCurrentSlide(index >= count - 1 ? 0 : index + 1);
  };

  const slide = slides[index] || {};

  return (
    <section className="relative text-white w-full overflow-hidden min-h-[640px] sm:min-h-[760px] lg:min-h-[880px] flex items-center bg-black">
      <AnimatePresence initial={false} custom={slideDirection} mode="sync">
        <motion.div
          key={index}
          custom={slideDirection}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.8 }}
          className="absolute inset-0 w-full h-full"
        >
          {slide.image?.url && <img src={slide.image.url} alt={slide.image.alt || ''} className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              {slide.badge && (
                <div className="inline-flex items-center bg-accent text-black rounded-full px-3 sm:px-4 py-2 mb-4 sm:mb-6">
                  <SafeIcon icon={FiStar} className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  <span className="text-xs sm:text-sm font-medium">{slide.badge}</span>
                </div>
              )}

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-heading font-bold mb-4 sm:mb-6 leading-tight text-balance">
                {slide.headline} <span className="text-accent">{slide.headlineAccent}</span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-neutral-200 leading-relaxed">
                {slide.subtext}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
            {primaryButton?.label && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <ButtonLink href={primaryButton.href} className="bg-accent text-black px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:brightness-90 transition-all duration-300 inline-flex items-center justify-center text-sm sm:text-base w-full sm:w-auto">
                  {primaryButton.label}
                  <SafeIcon icon={FiArrowRight} className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </ButtonLink>
              </motion.div>
            )}
            {secondaryButton?.label && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <ButtonLink href={secondaryButton.href} className="border-2 border-white/80 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-white hover:text-black transition-all duration-300 inline-flex items-center justify-center text-sm sm:text-base w-full sm:w-auto">
                  {secondaryButton.label}
                </ButtonLink>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {count > 1 && (
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
            {slides.map((_, n) => (
              <button
                key={n}
                onClick={() => goToSlide(n)}
                className={`h-2 rounded-full transition-all duration-300 ${n === index ? 'w-8 bg-accent' : 'w-2 bg-white/50 hover:bg-white/70'}`}
                aria-label={`Go to slide ${n + 1}`}
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
  );
};

export default HomeHero;
