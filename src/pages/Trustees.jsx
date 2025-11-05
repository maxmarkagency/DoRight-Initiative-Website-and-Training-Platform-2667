import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiHeart, FiTarget } = FiIcons;

const Trustees = () => {
  const trustees = [
    { id: 1, name: 'Pastor Wale Adefarasin', image: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759593162037-wale-adefarasin-1.jpg', description: 'Pastor Wale Adefarasin is the General Overseer of Guiding Light Assembly,he is presenter of \'The Heart of the matter\',a television programme that deals with social issues.', fullProfile: 'He is married to Pastor Olaolu Adefarasin and they have 3 children and 2 grandchildren. He is a firm believer in the sanctity of \'family\',and the importance of family in our national life. He believes that it is in the family that the character of our future leaders is forged. Pastor Wale Adefarasin has great hope in the future of Nigeria,and is passionate that there is a future and a hope for Nigeria,once its citizens arise to work for it.' },
    { id: 2, name: 'Ayodele Alamutu', image: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759593178510-alamutu-1.jpg', description: 'She is the founder of RollTheDice Global Resources,involved in Internal Control,Audit,Business Advisory and Risk Management Advisory Services. She is a Risk Management,Assurance and Control Executive with more than 25 years progressive experience in the UK and Nigeria.', fullProfile: 'Ms. Alamutu is a fellow of the Institute of Chartered Accountants of Nigeria,A Certified member of The Institute of Risk Management (CIRM) and currently the Vice Chair of IRM Nigeria Regional Group. She is an Information Systems Auditor,Project Management Professional and a Board member of the Institute of Internal Auditors. She has been mentoring youths for over 30years and is rewarded by living to witness the strides these youths have and are achieving today. This has geared her to continue her involvement with the youth and join them to help promote the tenets of Doing Right nationally. In her spare time,she loves to read and Zumba dance. Her risk management philosophy is to challenge management to consider extreme events and asymmetric risks that could impact their objectives and test them against their current activities.' },
    { id: 3, name: 'Ekeinde Ohiwerei', image: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759593181701-ekehinde-1.jpg', description: 'Ekeinde Ohiwerei has broad technical,commercial and leadership skills acquired in his career at Nigeria LNG Limited. His technical roles have been in maintenance,engineering and projects.', fullProfile: 'He has led key corporate activities and initiatives over the years. These include handling all contracting and procurement activities across and driving Nigerian Content. He currently leads the launched the company\'s digital transformation and energy transition agendas along with responsibilities for projects and engineering. Ekeinde is a member of the Nigerian Society of Engineers and Council for the Regulation of Engineering in Nigeria (COREN),as well as a member of the Chartered Institute of Procurement and Supply.' },
    { id: 4, name: 'Tunde Oduwole', image: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759593188790-oduwole-1.jpg', description: 'Tunde Oduwole is a passionate believer in Nigeria and the promise the country holds. He is currently the Financial Director at a multinational energy company in Nigeria.', fullProfile: 'He has nearly three decades of rich experience across commercial finance,corporate strategy,business development,audit and accounting across oil and gas industry,financial and management consulting in Africa,Europe and North America. He has served on Boards of multinational energy companies in Nigeria and West Africa and has led multi-billion dollars corporate and project finance transactions that unlocked immense economic opportunities for Nigeria in the upstream and midstream energy sectors. A Fellow of the Institute of Chartered Accountants of Nigeria,as well as an International Associate of the American Institute of Certified Public Accountants. He holds a Master of Science degree in Banking and Finance from Boston University,Massachusetts USA. An adventurous traveller,who enjoys painting,playing saxophone and producing stage plays. Among other plays,in 2017 he produced the critically acclaimed play "Gula" based on a written account of former President Olusegun Obasanjo\'s experience with a young underworld kingpin while a political prisoner.' },
    { id: 5, name: 'Ajibike Badeji', image: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759593192104-mrs-badeji-1.jpg', description: 'Ajibike Badeji has over 20 years combined experience in business,management and technology consulting. She is an accredited SMEDAN Business Development Service Provider (BDSP),a certified Scrum Master and a certified Learning and Performance Institute (LPI) Trainer.', fullProfile: 'She is passionate about Nigeria,entrepreneurs and the economic development of women and hence loves to coach and mentor entrepreneurs and young women. In addition to being an International Finance Corporation (IFC) Trainer,she brings extensive expertise in business development and technology consulting to help drive positive change in communities across Nigeria.' },
    { id: 6, name: 'Adeniyi Aromolaran', image: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759593586025-niyi-1.png', description: 'Adeniyi Aromolaran,MCIoD,FCIPM,FITD,HRPL,fondly referred to as "AA"- The Transformer\',is a Certified Sustainable Development Solutions & Modelling Consultant,an International Finance Corporation/Learning and Performance Institute (LPI) Certified Trainer.', fullProfile: 'He is an Expert-In-Residence at the Enterprise Development Centre,(EDC),Lagos Business School,(LBS) Pan African University,Lagos Nigeria. At various times he served on the Council of the Nigeria-Britain Association as the Honorary Deputy Financial Secretary,Honorary Financial Secretary,Honorary Treasurer and Honorary Secretary. He was a one-time Global President of Government College Lagos Old Boys Association,GCLOBA). He is presently the Executive Director,Enterprises Services Directorate at the Lagos State Development and Property Corporation,LSDPC. He is the Co-Convener/Co-Founder,Rethinking Nigeria Business Leadership Network. The network promotes the "Rethinking Business Conduct and Practices- a Sustainable Concept to Transforming Nigeria\'s Business Eco-System mind-set.' }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary-600 text-white py-20">
        <div className="max-w-container mx-auto px-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-4xl mx-auto">
            <h1 className="text-h1 font-heading font-bold mb-6 leading-tight"> OUR TRUSTEES </h1>
            <p className="text-xl text-blue-100 leading-relaxed"> Meet the distinguished leaders who guide DRAI's mission with their wisdom,expertise,and unwavering commitment to building a Nigeria of integrity and accountability. </p>
          </motion.div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-white">
        <div className="max-w-container mx-auto px-5">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto">
            <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <SafeIcon icon={FiUsers} className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-h2 font-heading font-bold text-neutral-900 mb-6"> Leadership with Purpose </h2>
            <p className="text-lg text-neutral-700 leading-relaxed"> Our Board of Trustees brings together exceptional individuals from diverse backgrounds - spiritual leadership,finance,engineering,business consulting,and sustainable development. Each trustee shares our vision of a Nigeria where integrity thrives and contributes their unique expertise to guide our strategic direction and ensure our impact reaches every corner of the nation. </p>
          </motion.div>
        </div>
      </section>

      {/* Trustees Profiles - Z Format */}
      <section className="py-20 bg-neutral-100">
        <div className="max-w-container mx-auto px-5">
          <div className="space-y-20">
            {trustees.map((trustee, index) => (
              <motion.div key={trustee.id} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: index * 0.1 }} viewport={{ once: true }} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                {/* Profile Content */}
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                    <div className="flex items-center mb-6">
                      <div className="bg-primary w-12 h-12 rounded-full flex items-center justify-center mr-4">
                        <SafeIcon icon={FiTarget} className="w-6 h-6 text-white" />
                      </div>
                      <div className="bg-accent px-3 py-1 rounded-full">
                        <span className="text-sm font-semibold text-neutral-900"> Board of Trustees </span>
                      </div>
                    </div>
                    <h2 className="text-h2 font-heading font-bold text-neutral-900 mb-4"> {trustee.name} </h2>
                    <p className="text-lg text-neutral-700 mb-6 leading-relaxed"> {trustee.description} </p>
                    <div className="bg-neutral-50 rounded-lg p-6 mb-6">
                      <p className="text-neutral-700 leading-relaxed"> {trustee.fullProfile} </p>
                    </div>
                    <div className="flex items-center text-primary">
                      <SafeIcon icon={FiHeart} className="w-5 h-5 mr-2" />
                      <span className="font-medium"> Committed to Nigeria's transformation through integrity </span>
                    </div>
                  </div>
                </div>
                {/* Profile Image */}
                <div className={index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                  <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }} className="relative">
                    <div className="relative overflow-hidden rounded-2xl shadow-xl">
                      <img src={trustee.image} alt={trustee.name} className="w-full h-96 lg:h-[500px] object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                      {/* Overlay with name */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
                          <h3 className="text-xl font-heading font-bold text-neutral-900 mb-1"> {trustee.name} </h3>
                          <p className="text-sm text-neutral-600"> Trustee #{String(index + 1).padStart(2, '0')} </p>
                        </div>
                      </div>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-accent rounded-full opacity-80"></div>
                    <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-primary rounded-full opacity-20"></div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-600 text-white">
        <div className="max-w-container mx-auto px-5 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <h2 className="text-h2 font-heading font-bold mb-6"> Guided by Excellence </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto"> Under the guidance of these distinguished trustees,DRAI continues to expand its impact across Nigeria,building communities of integrity and accountability that will transform our nation. </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/about" className="bg-accent text-neutral-900 px-8 py-4 rounded-lg font-semibold hover:brightness-90 transition-colors inline-flex items-center justify-center"> Learn More About DRAI </a>
              <a href="/join" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors inline-flex items-center justify-center"> Join Our Mission </a>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default Trustees;