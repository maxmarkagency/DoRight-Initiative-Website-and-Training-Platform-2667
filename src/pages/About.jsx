import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { getPageContent, getSectionByKey } from '../services/pageContentService';

const { FiUsers, FiTarget, FiEye, FiHeart, FiAward, FiTrendingUp, FiMapPin, FiCalendar, FiStar, FiGlobe } = FiIcons;

const About = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    const content = await getPageContent('about');
    setSections(content);
    setLoading(false);
  };

  const iconMap = { FiHeart, FiUsers, FiTarget, FiTrendingUp, FiEye, FiAward, FiCalendar };

  const heroSection = getSectionByKey(sections, 'hero');
  const missionSection = getSectionByKey(sections, 'mission');
  const visionSection = getSectionByKey(sections, 'vision');
  const valuesSection = getSectionByKey(sections, 'values');
  const timelineSection = getSectionByKey(sections, 'timeline');
  const teamSection = getSectionByKey(sections, 'team');

  const timeline = timelineSection?.content_data?.timeline || [
    { year: '2018', title: 'Foundation', description: 'Doing Right Awareness Initiative (DRAI) was founded by a group of passionate Nigerian citizens committed to promoting integrity and accountability.' },
    { year: '2019', title: 'First Community Programs', description: 'Launched our first youth mentorship programs in Lagos and Abuja,reaching over 500 young leaders.' },
    { year: '2020', title: 'Digital Expansion', description: 'Developed our first online training platform and launched digital reporting tools for citizens.' },
    { year: '2021', title: 'National Reach', description: 'Expanded operations to 15 states across Nigeria,establishing local chapters and partnerships.' },
    { year: '2022', title: 'Policy Impact', description: 'Our advocacy efforts contributed to 12 policy reforms at local and state government levels.' },
    { year: '2024', title: 'Comprehensive Platform', description: 'Launched our complete training and certification system,serving over 5,000 active learners.' }
  ];

  const values = valuesSection?.content_data?.values || [
    { icon: 'FiHeart', title: 'Integrity', description: 'We model the values we promote,operating with transparency and accountability in all our actions.' },
    { icon: 'FiUsers', title: 'Community-Centered', description: 'Our work is driven by communities,ensuring local ownership and sustainable impact.' },
    { icon: 'FiTarget', title: 'Results-Oriented', description: 'We measure our success by tangible improvements in governance and civic engagement.' },
    { icon: 'FiTrendingUp', title: 'Innovation', description: 'We leverage technology and creative approaches to solve complex social challenges.' }
  ];

  const stats = heroSection?.content_data?.stats || [
    { number: '6', label: 'Years of Impact', suffix: '+' },
    { number: '15', label: 'States Reached', suffix: '+' },
    { number: '5000', label: 'Citizens Trained', suffix: '+' },
    { number: '25', label: 'Policy Reforms', suffix: '+' }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-neutral-800 to-black text-white py-12 sm:py-16 lg:py-20 xl:py-24 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <motion.div animate={{ background: ["radial-gradient(circle at 20% 80%,rgba(255,193,7,0.15) 0%,transparent 50%)", "radial-gradient(circle at 80% 20%,rgba(255,193,7,0.15) 0%,transparent 50%)", "radial-gradient(circle at 40% 40%,rgba(255,193,7,0.15) 0%,transparent 50%)"] }} transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }} className="absolute inset-0" />
          {/* Floating icons */}
          {[FiStar, FiGlobe, FiUsers, FiTarget].map((Icon, index) => (
            <motion.div key={index} animate={{ y: [0, -30, 0], x: [0, 20, 0], rotate: [0, 180, 360], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 6 + index, repeat: Infinity, delay: index * 0.5, ease: "easeInOut" }} className="absolute hidden lg:block" style={{ top: `${20 + index * 15}%`, right: `${10 + index * 15}%` }}>
              <SafeIcon icon={Icon} className="w-6 h-6 lg:w-8 lg:h-8 text-accent/30" />
            </motion.div>
          ))}
        </div>

        <div className="relative max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8">
              <SafeIcon icon={FiUsers} className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-accent" />
              <span className="text-sm sm:text-base text-accent font-semibold">Our Story</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-heading font-bold mb-6 sm:mb-8 leading-tight">
              {heroSection?.title || 'About'}{' '}
              <motion.span animate={{ color: ['#FFC107', '#FFFFFF', '#FFC107'] }} transition={{ duration: 3, repeat: Infinity }} className="relative">
                DRAI
                <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1, delay: 1 }} className="absolute bottom-0 left-0 h-1 bg-accent rounded-full" />
              </motion.span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="text-base sm:text-lg md:text-xl lg:text-2xl text-neutral-300 leading-relaxed max-w-3xl mx-auto">
              {heroSection?.content || 'We are a movement of Nigerian citizens committed to building a culture of integrity,accountability,and civic responsibility across our nation.'}
            </motion.p>

            {/* Floating stats preview */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }} className="flex justify-center gap-4 sm:gap-6 lg:gap-8 mt-8 sm:mt-12">
              {stats.slice(0, 3).map((stat, index) => (
                <motion.div key={stat.label} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.6, delay: 0.8 + index * 0.1, type: "spring" }} className="text-center">
                  <div className="text-lg sm:text-2xl md:text-3xl font-bold text-accent mb-1"> {stat.number}{stat.suffix} </div>
                  <div className="text-xs sm:text-sm text-neutral-400"> {stat.label} </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission,Vision & Values */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center mb-12 sm:mb-16 lg:mb-20">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
              <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ duration: 0.6, type: "spring" }} viewport={{ once: true }} className="bg-primary w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <SafeIcon icon={FiTarget} className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
              </motion.div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-4 sm:mb-6"> {missionSection?.title || 'Our Mission'} </h2>
              <p className="text-sm sm:text-base lg:text-lg text-neutral-700 leading-relaxed"> {missionSection?.content || 'To promote integrity,accountability,and civic responsibility across Nigeria through education,advocacy,and community-led action,creating sustainable change from the grassroots up. We believe that lasting transformation comes from empowering citizens with the knowledge,tools,and networks needed to demand and create positive change in their communities.'} </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }}>
              <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ duration: 0.6, type: "spring" }} viewport={{ once: true }} className="bg-accent w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <SafeIcon icon={FiEye} className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-neutral-900" />
              </motion.div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-4 sm:mb-6"> {visionSection?.title || 'Our Vision'} </h2>
              <p className="text-sm sm:text-base lg:text-lg text-neutral-700 leading-relaxed"> {visionSection?.content || 'A Nigeria where integrity is the norm,where citizens actively participate in governance,and where transparent,accountable leadership drives sustainable development for all. We envision communities empowered to hold their leaders accountable,institutions that serve the public interest,and a culture where doing right is celebrated and rewarded.'} </p>
            </motion.div>
          </div>

          {/* Core Values */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-3 sm:mb-4"> {valuesSection?.title || 'Our Core Values'} </h2>
            <p className="text-sm sm:text-lg text-neutral-700 max-w-2xl mx-auto"> {valuesSection?.subtitle || 'These values guide everything we do and shape how we work with communities across Nigeria.'} </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {values.map((value, index) => (
              <motion.div key={value.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} whileHover={{ y: -10, scale: 1.05 }} className="text-center group">
                <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ duration: 0.6, delay: index * 0.1 + 0.2, type: "spring" }} viewport={{ once: true }} className="bg-gradient-to-br from-neutral-100 to-neutral-200 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:from-primary group-hover:to-primary-600 transition-all duration-300">
                  <SafeIcon icon={iconMap[value.icon] || FiTarget} className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary group-hover:text-white transition-colors duration-300" />
                </motion.div>
                <h3 className="text-base sm:text-lg lg:text-xl font-heading font-bold text-neutral-900 mb-3 sm:mb-4"> {value.title} </h3>
                <p className="text-sm sm:text-base text-neutral-700 leading-relaxed"> {value.description} </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Impact Statistics */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="max-w-container mx-auto px-5">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-h2 font-heading font-bold text-neutral-900 mb-4"> Our Impact Since 2018 </h2>
            <p className="text-lg text-neutral-700 max-w-2xl mx-auto"> Measurable results from our commitment to building integrity and accountability across Nigeria. </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} whileHover={{ scale: 1.05 }} className="text-center bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ duration: 0.8, delay: index * 0.1 + 0.3, type: "spring" }} viewport={{ once: true }} className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.number}{stat.suffix}
                </motion.div>
                <div className="text-neutral-700 font-medium"> {stat.label} </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-3 sm:mb-4"> {timelineSection?.title || 'Our Journey'} </h2>
            <p className="text-sm sm:text-lg text-neutral-700 max-w-2xl mx-auto"> {timelineSection?.subtitle || 'Key milestones in our mission to promote integrity and accountability across Nigeria.'} </p>
          </motion.div>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 sm:w-1 bg-primary h-full hidden sm:block"></div>
            <div className="space-y-8 sm:space-y-12">
              {timeline.map((item, index) => (
                <motion.div key={item.year} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: index * 0.1 }} viewport={{ once: true }} className={`flex items-center ${index % 2 === 0 ? 'flex-col sm:flex-row' : 'flex-col sm:flex-row-reverse'} gap-4`}>
                  <div className={`w-full sm:w-1/2 ${index % 2 === 0 ? 'sm:pr-8 sm:text-right text-center' : 'sm:pl-8 text-center'}`}>
                    <motion.div whileHover={{ scale: 1.02, y: -5 }} className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center justify-center sm:justify-start mb-3">
                        <SafeIcon icon={FiCalendar} className="w-4 h-4 sm:w-5 sm:h-5 text-primary mr-2" />
                        <span className="text-primary font-bold text-base sm:text-lg">{item.year}</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-heading font-bold text-neutral-900 mb-2 sm:mb-3"> {item.title} </h3>
                      <p className="text-sm sm:text-base text-neutral-700 leading-relaxed"> {item.description} </p>
                    </motion.div>
                  </div>
                  <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ duration: 0.6, delay: index * 0.1 + 0.3, type: "spring" }} viewport={{ once: true }} className="w-3 h-3 sm:w-4 sm:h-4 bg-primary rounded-full relative z-10 shadow-lg hidden sm:block" />
                  <div className="w-full sm:w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-neutral-100">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-3 sm:mb-4"> {teamSection?.title || 'Meet Our Team'} </h2>
            <p className="text-sm sm:text-lg text-neutral-700 max-w-2xl mx-auto"> {teamSection?.subtitle || 'The passionate individuals behind DRAI\'s mission to promote integrity and accountability across Nigeria.'} </p>
          </motion.div>

          {/* Team Photo */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="mb-12 sm:mb-16">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img src={teamSection?.image_url || "https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759575290797-DSC_0360-scaled-2-1536x1024.jpg"} alt="DRAI team members in matching uniforms" className="w-full h-64 sm:h-80 lg:h-96 xl:h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
                <motion.h3 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} viewport={{ once: true }} className="text-lg sm:text-2xl md:text-3xl font-heading font-bold text-white mb-2 sm:mb-3"> {teamSection?.title || 'Our Dedicated Team'} </motion.h3>
                <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} viewport={{ once: true }} className="text-sm sm:text-base lg:text-lg text-neutral-200 leading-relaxed max-w-3xl">
                  {teamSection?.content || 'Meet the passionate DRAI team members who work tirelessly to promote integrity and civic responsibility across Nigerian communities. Together,we\'re building a movement that transforms lives and strengthens democracy.'}
                </motion.p>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Enhanced Call to Action */}
      <section className="py-20 bg-gradient-to-br from-primary via-neutral-800 to-black text-white relative overflow-hidden">
        {/* Background animation */}
        <motion.div animate={{ background: ["radial-gradient(circle at 30% 70%,rgba(255,193,7,0.1) 0%,transparent 50%)", "radial-gradient(circle at 70% 30%,rgba(255,193,7,0.1) 0%,transparent 50%)"] }} transition={{ duration: 6, repeat: Infinity, repeatType: "reverse" }} className="absolute inset-0" />
        <div className="relative max-w-container mx-auto px-5 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ duration: 0.8, type: "spring" }} viewport={{ once: true }} className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
              <SafeIcon icon={FiHeart} className="w-5 h-5 mr-2 text-accent" />
              <span className="text-accent font-semibold">Join Our Mission</span>
            </motion.div>
            <h2 className="text-h2 font-heading font-bold mb-6"> Join Our Mission </h2>
            <p className="text-xl text-neutral-300 mb-8 max-w-2xl mx-auto"> Be part of building a Nigeria where integrity thrives and accountability is the standard. </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/join" className="bg-accent text-neutral-900 px-8 py-4 rounded-xl font-semibold hover:brightness-90 transition-colors inline-flex items-center justify-center shadow-lg"> Get Involved </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/training" className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-primary transition-colors inline-flex items-center justify-center"> Start Learning </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default About;