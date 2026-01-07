import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { getPageContent, getSectionByKey } from '../services/pageContentService';

const { FiUsers, FiTarget, FiTrendingUp, FiShield, FiArrowRight, FiCheck } = FiIcons;

const Programs = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    const content = await getPageContent('programs');
    setSections(content);
    setLoading(false);
  };

  const iconMap = { FiUsers, FiTarget, FiTrendingUp, FiShield };

  const heroSection = getSectionByKey(sections, 'hero');
  const impactStatsSection = getSectionByKey(sections, 'impact_stats');
  const programsListSection = getSectionByKey(sections, 'programs_list');
  const howWeWorkSection = getSectionByKey(sections, 'how_we_work');

  const programs = programsListSection?.content_data?.programs || [
    { title: 'Youth Mentorship', subtitle: 'Leadership for Tomorrow', description: 'Empowering the next generation of integrity champions through comprehensive mentorship programs,leadership workshops,and peer-led community projects in schools across Nigeria.', features: ['Interactive classroom sessions', 'One-on-one mentorship pairing', 'Student leadership development', 'Character building workshops', 'Peer-to-peer learning networks'], icon: 'FiUsers', image: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759595241762-Do-right-awarenss-initiative-school-project-7-scaled-2-1536x1024.jpg' },
    { title: 'Community Campaigns', subtitle: 'Local Action for Change', description: 'Grassroots mobilization initiatives that promote civic awareness,accountability,and community pride through targeted campaigns and local projects.', features: ['Community awareness campaigns', 'Door-to-door civic education', 'Local government engagement sessions', 'Volunteer coordination and training', 'Public accountability forums'], icon: 'FiTarget', image: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759595235026-Do-right-awarenss-initiative-school-project-9-scaled-2-1536x1024.jpg' },
    { title: 'Policy Advocacy', subtitle: 'Systemic Change Through Research', description: 'Evidence-based policy research and strategic engagement with stakeholders to create lasting institutional reforms and systemic improvements.', features: ['Policy research and analysis', 'Stakeholder engagement sessions', 'Legislative advocacy', 'Reform implementation monitoring', 'Coalition building with partners'], icon: 'FiTrendingUp', image: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759595248284-Do-right-awarenss-initiative-school-project-13-scaled-2-1536x1024.jpg' },
    { title: 'Educational Outreach', subtitle: 'Knowledge Sharing & Resource Distribution', description: 'Comprehensive educational initiatives that provide learning materials,resources,and direct support to schools and communities across Nigeria.', features: ['Educational resource distribution', 'School partnership programs', 'Teacher training workshops', 'Student scholarship support', 'Community learning centers'], icon: 'FiShield', image: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759595280475-Do-right-awarenss-initiative-school-project-10-scaled-2-1536x1024.jpg' }
  ];

  const impact = impactStatsSection?.content_data?.stats || [
    { number: '5,000+', label: 'Citizens Engaged' },
    { number: '50+', label: 'Communities Reached' },
    { number: '100+', label: 'Leaders Trained' },
    { number: '25+', label: 'Policy Changes Influenced' }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-600 text-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 sm:mb-6 leading-tight"> {heroSection?.title || 'Our Programs'} </h1>
            <p className="text-base sm:text-lg md:text-xl text-neutral-300 leading-relaxed"> {heroSection?.content || 'Comprehensive community-led solutions designed to promote integrity,accountability,and civic responsibility across Nigeria through education,advocacy,and grassroots action.'} </p>
          </motion.div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {impact.map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 sm:mb-2"> {stat.number} </div>
                <div className="text-sm sm:text-base text-neutral-700 font-medium"> {stat.label} </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-neutral-100">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12 sm:space-y-16 lg:space-y-20">
            {programs.map((program, index) => (
              <motion.div key={program.title} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: index * 0.1 }} viewport={{ once: true }} className={`grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="bg-gradient-to-r from-primary to-primary-600 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                    <SafeIcon icon={iconMap[program.icon] || FiTarget} className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-1 sm:mb-2"> {program.title} </h2>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-primary mb-4 sm:mb-6"> {program.subtitle} </h3>
                  <p className="text-sm sm:text-base lg:text-lg text-neutral-700 mb-6 sm:mb-8 leading-relaxed"> {program.description} </p>
                  <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    {program.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <SafeIcon icon={FiCheck} className="w-4 h-4 sm:w-5 sm:h-5 text-primary mr-2 sm:mr-3 flex-shrink-0" />
                        <span className="text-sm sm:text-base text-neutral-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <button className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors inline-flex items-center text-sm sm:text-base">
                    Learn More
                    <SafeIcon icon={FiArrowRight} className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
                <div className={index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                  <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }} className="relative">
                    <img src={program.image} alt={program.title} className="rounded-lg shadow-xl w-full h-64 sm:h-80 lg:h-96 xl:h-[500px] object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent rounded-lg"></div>
                    {/* Overlay with program info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                        <h3 className="text-lg sm:text-xl font-heading font-bold text-neutral-900 mb-1"> {program.title} </h3>
                        <p className="text-xs sm:text-sm text-neutral-600"> {program.subtitle} </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-4 sm:mb-6"> {howWeWorkSection?.title || 'How We Create Change'} </h2>
            <p className="text-sm sm:text-lg text-neutral-700 max-w-3xl mx-auto leading-relaxed"> {howWeWorkSection?.content || 'Our integrated approach combines community mobilization with institutional engagement,creating sustainable change from the grassroots up while influencing policy at the highest levels.'} </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[{ title: 'Community Engagement', description: 'We start at the grassroots level,working directly with communities to identify challenges and build local capacity for change.', icon: FiUsers }, { title: 'Evidence-Based Advocacy', description: 'Our research and data collection inform targeted advocacy efforts that address systemic issues and promote policy reform.', icon: FiTarget }, { title: 'Sustainable Impact', description: 'We measure outcomes and adapt our strategies to ensure lasting change that communities can maintain and expand.', icon: FiTrendingUp }].map((item, index) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }} className="text-center">
                <div className="bg-primary w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <SafeIcon icon={item.icon} className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-heading font-bold text-neutral-900 mb-3 sm:mb-4"> {item.title} </h3>
                <p className="text-sm sm:text-base text-neutral-700 leading-relaxed"> {item.description} </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Real Impact Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-4 sm:mb-6"> Real Programs,Real Impact </h2>
            <p className="text-sm sm:text-lg text-neutral-700 max-w-3xl mx-auto leading-relaxed"> These images showcase our actual work in Nigerian schools and communities - from classroom mentorship sessions to community outreach programs and educational resource distribution. </p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <div className="bg-primary/10 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <SafeIcon icon={FiUsers} className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-heading font-bold text-neutral-900 mb-3 sm:mb-4"> In the Classroom </h3>
              <p className="text-sm sm:text-base text-neutral-700 leading-relaxed mb-3 sm:mb-4"> Our educators work directly with students in their learning environments,fostering discussions about integrity,leadership,and civic responsibility through interactive sessions and practical exercises. </p>
              <ul className="text-xs sm:text-sm text-neutral-600 space-y-1 sm:space-y-2">
                <li>• Direct student engagement in schools</li>
                <li>• Interactive integrity workshops</li>
                <li>• Character development programs</li>
                <li>• Peer learning facilitation</li>
              </ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <div className="bg-accent/10 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <SafeIcon icon={FiTarget} className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
              </div>
              <h3 className="text-lg sm:text-xl font-heading font-bold text-neutral-900 mb-3 sm:mb-4"> In the Community </h3>
              <p className="text-sm sm:text-base text-neutral-700 leading-relaxed mb-3 sm:mb-4"> Beyond the classroom,we engage with community members,distribute educational resources,and create platforms for dialogue about accountability and positive change in local governance. </p>
              <ul className="text-xs sm:text-sm text-neutral-600 space-y-1 sm:space-y-2">
                <li>• Community dialogue sessions</li>
                <li>• Educational resource distribution</li>
                <li>• Local partnership building</li>
                <li>• Civic engagement training</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-primary to-primary-600 text-white">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-heading font-bold mb-4 sm:mb-6"> Get Involved in Our Programs </h2>
            <p className="text-base sm:text-lg md:text-xl text-neutral-300 mb-6 sm:mb-8 max-w-2xl mx-auto"> Whether you're interested in volunteering,partnering with us,or starting a program in your community,we'd love to work with you. </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button className="bg-accent text-neutral-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:brightness-90 transition-colors inline-flex items-center justify-center text-sm sm:text-base w-full sm:w-auto">
                Volunteer Now
                <SafeIcon icon={FiArrowRight} className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors inline-flex items-center justify-center text-sm sm:text-base w-full sm:w-auto"> Partner With Us </button>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Programs;