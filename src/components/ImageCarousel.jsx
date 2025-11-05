import React,{useState,useEffect} from 'react';
import {motion,AnimatePresence} from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const {FiChevronLeft,FiChevronRight,FiPlay,FiPause}=FiIcons;

const ImageCarousel=({
  images=[],
  autoPlay=true,
  autoPlayInterval=5000,
  showControls=true,
  showIndicators=true,
  className="",
  aspectRatio="16/9"
})=> {
  const [currentIndex,setCurrentIndex]=useState(0);
  const [isPlaying,setIsPlaying]=useState(autoPlay);
  const [direction,setDirection]=useState(0);

  // Default images if none provided
  const defaultImages=[
    {
      id: 1,
      src: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759570847937-Do-right-awarenss-initiative-school-project-6-scaled-2%20%281%29.jpg',
      alt: 'DRAI teacher engaging with students in classroom',
      title: 'Empowering Education',
      description: 'Our educators work directly with students to promote integrity and civic responsibility in schools across Nigeria.'
    },
    {
      id: 2,
      src: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759570856796-Do-right-awarenss-initiative-school-project-6-scaled-2.jpg',
      alt: 'Students learning about integrity and civic responsibility',
      title: 'Building Future Leaders',
      description: 'Young Nigerians learning the principles of integrity,leadership,and community service in our educational programs.'
    },
    {
      id: 3,
      src: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759570877162-Capture.PNG',
      alt: 'Group of students with DRAI materials',
      title: 'Community Impact',
      description: 'Students proudly displaying their commitment to the DRAI principles and values in their local community.'
    }
  ];

  const carouselImages=images.length > 0 ? images : defaultImages;

  useEffect(()=> {
    if (isPlaying && carouselImages.length > 1) {
      const interval=setInterval(()=> {
        setDirection(1);
        setCurrentIndex((prevIndex)=>
          prevIndex===carouselImages.length - 1 ? 0 : prevIndex + 1
        );
      },autoPlayInterval);

      return ()=> clearInterval(interval);
    }
  },[isPlaying,autoPlayInterval,carouselImages.length]);

  const goToNext=()=> {
    setDirection(1);
    setCurrentIndex((prevIndex)=>
      prevIndex===carouselImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrev=()=> {
    setDirection(-1);
    setCurrentIndex((prevIndex)=>
      prevIndex===0 ? carouselImages.length - 1 : prevIndex - 1
    );
  };

  const goToSlide=(index)=> {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const togglePlayPause=()=> {
    setIsPlaying(!isPlaying);
  };

  const slideVariants={
    enter: (direction)=> ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction)=> ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold=10000;
  const swipePower=(offset,velocity)=> {
    return Math.abs(offset) * velocity;
  };

  if (carouselImages.length===0) {
    return (
      <div className={`bg-neutral-200 rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-neutral-500">No images available</p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg shadow-lg group ${className}`}>
      <div className="relative w-full" style={{aspectRatio}}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: {type: "spring",stiffness: 300,damping: 30},
              opacity: {duration: 0.2}
            }}
            drag="x"
            dragConstraints={{left: 0,right: 0}}
            dragElastic={1}
            onDragEnd={(e,{offset,velocity})=> {
              const swipe=swipePower(offset.x,velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                goToNext();
              } else if (swipe > swipeConfidenceThreshold) {
                goToPrev();
              }
            }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={carouselImages[currentIndex].src}
              alt={carouselImages[currentIndex].alt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Overlay with content */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <motion.h3
                  initial={{opacity: 0,y: 20}}
                  animate={{opacity: 1,y: 0}}
                  transition={{delay: 0.2}}
                  className="text-xl md:text-2xl font-heading font-bold mb-2"
                >
                  {carouselImages[currentIndex].title}
                </motion.h3>
                <motion.p
                  initial={{opacity: 0,y: 20}}
                  animate={{opacity: 1,y: 0}}
                  transition={{delay: 0.3}}
                  className="text-sm md:text-base text-neutral-200 leading-relaxed max-w-2xl"
                >
                  {carouselImages[currentIndex].description}
                </motion.p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        {showControls && carouselImages.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
              aria-label="Previous image"
            >
              <SafeIcon icon={FiChevronLeft} className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
              aria-label="Next image"
            >
              <SafeIcon icon={FiChevronRight} className="w-6 h-6" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
              aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              <SafeIcon icon={isPlaying ? FiPause : FiPlay} className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Indicators */}
        {showIndicators && carouselImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            {carouselImages.map((_,index)=> (
              <button
                key={index}
                onClick={()=> goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index===currentIndex
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Loading indicator for next image */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
          {isPlaying && (
            <motion.div
              className="h-full bg-accent"
              initial={{width: "0%"}}
              animate={{width: "100%"}}
              transition={{
                duration: autoPlayInterval / 1000,
                ease: "linear",
                repeat: Infinity
              }}
            />
          )}
        </div>
      </div>

      {/* Image counter */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        {currentIndex + 1} / {carouselImages.length}
      </div>
    </div>
  );
};

export default ImageCarousel;