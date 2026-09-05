import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import supabase from '../lib/supabase';
import useSeo from '../hooks/useSeo';
import { joinSubCommittee } from '../services/leadsService';

const {
  FiUsers,
  FiCheckCircle,
  FiArrowRight,
  FiFileText,
  FiDollarSign,
  FiCompass,
  FiBookOpen,
  FiVideo,
  FiCast,
  FiX,
  FiCheck,
  FiMail,
  FiPhone,
  FiUser,
  FiShield,
  FiExternalLink,
  FiAlertCircle,
  FiLoader,
  FiLock,
  FiAward
} = FiIcons;

export const SUB_COMMITTEES_DATA = [
  {
    id: 'secretariat',
    number: '1',
    name: 'Secretariat (Admin) Sub-Committee',
    shortName: 'Secretariat (Admin)',
    icon: FiFileText,
    accentColor: '#3B82F6', // Blue
    bgGradient: 'from-blue-50 to-indigo-50/50',
    borderColor: 'border-blue-200',
    tagColor: 'bg-blue-100 text-blue-800',
    whatsappLink: 'https://chat.whatsapp.com/DRAISecretariatSubCommittee',
    description:
      'The Secretariat serves as the operational backbone of DRAI, managing internal communications, volunteer governance, administrative compliance, and event logistics.',
    responsibilities: [
      {
        title: 'Internal Governance',
        desc: 'Facilitate group engagement, manage official WhatsApp community channels, and maintain inter-departmental communication.'
      },
      {
        title: 'Human Resources',
        desc: 'Oversee recruitment, onboarding, deployment, and records of employees and digital/field volunteers.'
      },
      {
        title: 'Logistics & Operations',
        desc: 'Direct operational logistics for physical and virtual events, meetings, and facilitator sessions.'
      },
      {
        title: 'Reporting & Administration',
        desc: 'Collate progress updates from committee leads, submit proposals, compile administrative reports, and publish impact reports.'
      },
      {
        title: 'Post-Initiative Support',
        desc: 'Coordinate administrative follow-up and support programs for program beneficiaries.'
      }
    ]
  },
  {
    id: 'finance-fundraising',
    number: '2',
    name: 'Finance & Fundraising Sub-Committee',
    shortName: 'Finance & Fundraising',
    icon: FiDollarSign,
    accentColor: '#10B981', // Emerald
    bgGradient: 'from-emerald-50 to-teal-50/50',
    borderColor: 'border-emerald-200',
    tagColor: 'bg-emerald-100 text-emerald-800',
    whatsappLink: 'https://chat.whatsapp.com/DRAIFinanceFundraising',
    description:
      'Ensures financial integrity, budgetary control, resource mobilization, and revenue diversification to support our long-term organizational sustainability.',
    responsibilities: [
      {
        title: 'Financial Management',
        desc: 'Oversee budgeting, track expenditure against strategic goals, prepare monthly financial reports, and maintain annual audit readiness.'
      },
      {
        title: 'Grant Acquisition',
        desc: 'Research, draft, and submit grant applications to local and international funding bodies.'
      },
      {
        title: 'Corporate Partnerships',
        desc: 'Design and execute corporate fundraising initiatives, securing long-term donor and CSR commitments.'
      },
      {
        title: 'Revenue Generation & Merchandising',
        desc: 'Manage design, production, pricing, and sales of branded merchandise (e.g., "Yellow Man" apparel and pins) as a revenue engine.'
      },
      {
        title: 'Special Project Sourcing',
        desc: 'Mobilize dedicated funding for our initiatives (e.g., After-School Clubs, Correctional Center interventions, and Legal Advocacy programs).'
      }
    ]
  },
  {
    id: 'strategy',
    number: '3',
    name: 'Strategy Sub-Committee',
    shortName: 'Strategy & Alliances',
    icon: FiCompass,
    accentColor: '#8B5CF6', // Purple
    bgGradient: 'from-purple-50 to-fuchsia-50/50',
    borderColor: 'border-purple-200',
    tagColor: 'bg-purple-100 text-purple-800',
    whatsappLink: 'https://chat.whatsapp.com/DRAIStrategySubCommittee',
    description:
      'Leads organizational growth, institutional alliances, multi-state expansion, and high-level strategic events to scale our national presence.',
    responsibilities: [
      {
        title: 'Institutional Alliances',
        desc: 'Build and formalize strategic partnerships with educational bodies, corporate workplaces, CSOs, NGOs, religious institutions, and government agencies.'
      },
      {
        title: 'Conference & Event Strategy',
        desc: 'Lead concept development, theme formulation, venue securing, and speaker engagement for the annual Doing Right Conference and major summits.'
      },
      {
        title: 'Technical & Advisory Integration',
        desc: 'Engage technical consultants and collaborate with Finance on major grant proposals and institutional strategies.'
      },
      {
        title: 'Recognition Initiatives',
        desc: 'Conceptualize and roll out awards frameworks to celebrate public integrity champions.'
      },
      {
        title: 'Expansion Framework',
        desc: 'Formulate and implement our eventual multi-state expansion plan.'
      }
    ]
  },
  {
    id: 'after-school-training',
    number: '4',
    name: 'After-School Club & Training Sub-Committee',
    shortName: 'After-School & Training',
    icon: FiBookOpen,
    accentColor: '#F59E0B', // Amber
    bgGradient: 'from-amber-50 to-orange-50/50',
    borderColor: 'border-amber-200',
    tagColor: 'bg-amber-100 text-amber-900',
    whatsappLink: 'https://chat.whatsapp.com/DRAIAfterSchoolTraining',
    description:
      'This sub-committee focuses on direct educational interventions, youth mentorship, facilitator training, and institutionalizing values education in educational and community settings.',
    responsibilities: [
      {
        title: 'Curriculum Development',
        desc: 'Design, update, and standardize the "Do Right" School Curriculum, workplace ethics manuals, interactive learning tools, and assessment metrics.'
      },
      {
        title: 'Facilitator Training & Deployment',
        desc: 'Recruit, train, and deploy facilitators across educational, workplace, and community institutions.'
      },
      {
        title: 'Club Activation',
        desc: 'Establish and sustain functional "Doing Right Clubs" across partner schools.'
      },
      {
        title: 'Inter-religious Community Integration',
        desc: 'Partner and train religious leaders and community educators to integrate values-based modules into their local environment.'
      },
      {
        title: 'Monitoring & Evaluation',
        desc: 'Track participation, measure intervention outcomes, and compile reach metrics.'
      }
    ]
  },
  {
    id: 'media-tech',
    number: '5',
    name: 'Media & Technology Sub-Committee',
    shortName: 'Media & Technology',
    icon: FiVideo,
    accentColor: '#EC4899', // Pink / Rose
    bgGradient: 'from-pink-50 to-rose-50/50',
    borderColor: 'border-pink-200',
    tagColor: 'bg-pink-100 text-pink-800',
    whatsappLink: 'https://chat.whatsapp.com/DRAIMediaTechSubCommittee',
    description:
      'Manages digital real estate, brand management, public relations, technology infrastructure, and campaign communications.',
    responsibilities: [
      {
        title: 'Digital Media Production',
        desc: 'Create and publish short-form video series, animated skits, and daily digital campaign content across all our social media platforms (TikTok, Instagram, X, YouTube and Facebook).'
      },
      {
        title: 'Web & Platform Administration',
        desc: 'Oversee website maintenance (doright.ng), blog management, cybersecurity, and podcast syndication across YouTube and Spotify.'
      },
      {
        title: 'Public Relations & Storytelling',
        desc: 'Produce press kits, monthly newsletters, media releases, and post-event recaps; transform organizational milestones into digital assets.'
      },
      {
        title: 'Public Relations & Media Blitzes',
        desc: 'Distribute press kits, press releases, and media recaps following major organization events. Publish newsletters and impact reports virtually.'
      },
      {
        title: 'Yellow Man Campaign Execution',
        desc: 'Drive nationwide digital and street-level campaigns using interactive skits, street interviews, and public activations.'
      }
    ]
  },
  {
    id: 'webinar',
    number: '6',
    name: 'Webinar Sub-Committee',
    shortName: 'Webinar & Virtual Learning',
    icon: FiCast,
    accentColor: '#06B6D4', // Cyan
    bgGradient: 'from-cyan-50 to-sky-50/50',
    borderColor: 'border-cyan-200',
    tagColor: 'bg-cyan-100 text-cyan-800',
    whatsappLink: 'https://chat.whatsapp.com/DRAIWebinarSubCommittee',
    description:
      'Plans and executes virtual learning sessions to maintain continuous engagement with youth, professionals, and civic audiences.',
    responsibilities: [
      {
        title: 'Quarterly Webinar Series',
        desc: 'Design topics, recruit expert speakers, and host at least 4 flagship webinars annually on civic responsibility, digital ethics, and leadership.'
      },
      {
        title: 'Community Engagement',
        desc: 'Host regular virtual talk sessions featuring core members, guest speakers, and ethics champions.'
      },
      {
        title: 'Content Repurposing',
        desc: 'Conceptualize the conversion of webinar recordings into reusable educational assets, including articles, social quotes, short clips, and resource guides.'
      },
      {
        title: 'Metrics & Analytics',
        desc: 'Monitor attendance, analyze participant feedback, and deliver quarterly engagement reports.'
      }
    ]
  }
];

const SubCommittees = () => {
  useSeo({
    path: '/sub-committees',
    title: 'Sub-Committee Roles & Responsibilities',
    description:
      'Explore the six specialized operational sub-committees of the Doing Right Awareness Initiative (DRAI) driving execution, governance, financial sustainability, and national public impact.'
  });

  const [searchParams] = useSearchParams();
  const prefilledId = searchParams.get('id') || searchParams.get('membershipId') || '';
  const prefilledEmail = searchParams.get('email') || '';
  const preselectedCommitteeId = searchParams.get('select') || '';

  const [selectedCommittee, setSelectedCommittee] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: prefilledEmail,
    phone: '',
    membershipId: prefilledId
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [restrictionData, setRestrictionData] = useState(null);
  const [verifiedMember, setVerifiedMember] = useState(null);
  const [customWhatsAppLinks, setCustomWhatsAppLinks] = useState({});

  // Auto-open modal if specified in URL
  useEffect(() => {
    if (preselectedCommitteeId) {
      const match = SUB_COMMITTEES_DATA.find((c) => c.id === preselectedCommitteeId);
      if (match) setSelectedCommittee(match);
    }
  }, [preselectedCommitteeId]);

  // Load custom WhatsApp links from site_settings if available
  useEffect(() => {
    supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'sub_committee_whatsapp_links')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.setting_value) {
          setCustomWhatsAppLinks(data.setting_value);
        }
      });
  }, []);

  const openJoinModal = (committee) => {
    setSelectedCommittee(committee);
    setIsJoined(false);
    setJoinError('');
    setRestrictionData(null);
  };

  const closeJoinModal = () => {
    setSelectedCommittee(null);
    setIsJoined(false);
    setJoinError('');
    setRestrictionData(null);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (joinError) setJoinError('');
    if (restrictionData) setRestrictionData(null);
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    setJoinError('');
    setRestrictionData(null);

    const cleanMembershipId = formData.membershipId.trim().toUpperCase();
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanFullName = formData.fullName.trim();

    if (!cleanMembershipId) {
      setJoinError('Please enter your official DRAI Membership ID (e.g. DRAI-2026-1234).');
      return;
    }

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setJoinError('Please provide your valid registered email address.');
      return;
    }

    if (!cleanFullName || cleanFullName.length < 2) {
      setJoinError('Please enter your full name as registered on your membership.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await joinSubCommittee({
        membershipId: cleanMembershipId,
        email: cleanEmail,
        fullName: cleanFullName,
        phone: formData.phone.trim() || null,
        subCommitteeId: selectedCommittee.id,
        subCommitteeName: selectedCommittee.name
      });

      setVerifiedMember(result?.lead || {
        full_name: cleanFullName,
        membership_id: cleanMembershipId,
        email: cleanEmail
      });
      setIsJoined(true);
    } catch (err) {
      console.warn('Sub-committee verification notice:', err);
      if (err.code === 'NOT_TIER_3') {
        setRestrictionData({
          error: 'NOT_TIER_3',
          currentTier: err.currentTier,
          currentTierLabel: err.currentTierLabel || 'Tier 1 / Tier 2',
          message: err.message || 'Access Restricted: Sub-committees are exclusively reserved for Tier 3 (Strategic Leaders).'
        });
      } else if (err.code === 'MEMBER_NOT_FOUND' || err.code === 'CREDENTIAL_MISMATCH') {
        setJoinError(err.message || 'No active membership record was found matching this Membership ID and Email. Sub-committees are exclusively for verified Tier 3 Strategic Leaders.');
      } else {
        setJoinError(err.message || 'An error occurred while validating your membership standing. Please try again or contact admin@doright.ng.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeWhatsAppLink =
    selectedCommittee &&
    (customWhatsAppLinks[selectedCommittee.id] || selectedCommittee.whatsappLink || 'https://chat.whatsapp.com/CuwrXFIM8Ry2DZUImaHIxn?s=cl&p=i&ilr=4&amv=1');

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-amber-500 selection:text-slate-950">
      {/* Header Banner */}
      <section className="relative overflow-hidden pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 border-b border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Leadership Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-sm">
              <SafeIcon icon={FiShield} className="w-4 h-4 text-amber-400" />
              <span>Operational Leadership • Specialized Groups</span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-5xl font-black text-white font-heading tracking-tight leading-tight">
              Sub-Committee Roles and Responsibilities
            </h1>

            {/* Strategic Leader Greeting Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-2xl space-y-4">
              <div className="text-amber-400 font-extrabold text-lg sm:text-xl font-heading">
                Dear Tier 3 Advocate,
              </div>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                As you step into a strategic leadership position, you also take on the role of an operational leader and are required to join one sub-committee.
              </p>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                These groups turn our mission into action and we have <strong className="text-amber-400">six specialized teams</strong> that drive execution, governance, financial sustainability, and public impact.
              </p>
              <p className="text-sm sm:text-base text-amber-300/90 font-medium">
                Please review the roles of each sub-committee below and select the one you want to join.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sub-Committees List Section */}
      <section className="py-16 sm:py-24 bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
          {SUB_COMMITTEES_DATA.map((committee, idx) => {
            const IconComponent = committee.icon;
            return (
              <motion.div
                key={committee.id}
                id={committee.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="bg-slate-800/90 rounded-3xl border border-slate-700/80 overflow-hidden shadow-2xl transition-all hover:border-slate-600 group"
              >
                {/* Committee Header Banner */}
                <div className="p-6 sm:p-8 border-b border-slate-700/70 bg-gradient-to-r from-slate-800 to-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-4">
                    <div
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md text-white"
                      style={{ backgroundColor: committee.accentColor }}
                    >
                      <SafeIcon icon={IconComponent} className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-amber-400">
                        Sub-Committee {committee.number}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">
                        {committee.name}
                      </h2>
                    </div>
                  </div>

                  {/* Join Sub-Committee Button */}
                  <button
                    type="button"
                    onClick={() => openJoinModal(committee)}
                    className="self-start md:self-center px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-amber-400/20 active:scale-95 inline-flex items-center gap-2"
                  >
                    <span>Join This Sub-Committee</span>
                    <SafeIcon icon={FiArrowRight} className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>

                {/* Body Content */}
                <div className="p-6 sm:p-8 space-y-6">
                  {/* Overview Description */}
                  <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-medium">
                    {committee.description}
                  </p>

                  {/* Responsibilities Grid */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Key Roles &amp; Operational Responsibilities:
                    </h3>
                    <div className="grid grid-cols-1 gap-3.5">
                      {committee.responsibilities.map((resp, rIdx) => (
                        <div
                          key={rIdx}
                          className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-start gap-3.5 hover:bg-slate-900/90 transition-colors"
                        >
                          <div className="mt-1 w-5 h-5 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center flex-shrink-0">
                            <SafeIcon icon={FiCheck} className="w-3 h-3 text-amber-400 stroke-[3]" />
                          </div>
                          <div className="text-sm text-slate-300 leading-relaxed">
                            <strong className="text-white font-semibold">{resp.title}:</strong> {resp.desc}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action Footer for Mobile & Fast Access */}
                  <div className="pt-4 border-t border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <span className="text-xs text-slate-400">
                      Requirement: 70% active meeting involvement &amp; assigned monthly task delivery.
                    </span>
                    <button
                      type="button"
                      onClick={() => openJoinModal(committee)}
                      className="text-amber-400 hover:text-amber-300 font-bold text-sm inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span>Select {committee.shortName}</span>
                      <SafeIcon icon={FiArrowRight} className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Footer Note */}
          <div className="p-8 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-amber-400 font-heading">
              Thank you for selecting a sub-committee and helping us to sustain and grow our movement
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              If you have any questions or need guidance on selecting your committee, contact our admin team on{' '}
              <a href="tel:+2349123399968" className="text-amber-400 font-semibold underline">
                +234 912 339 9968
              </a>{' '}
              or reach our Managing Director on{' '}
              <a href="tel:+2348023298260" className="text-amber-400 font-semibold underline">
                +234 802 329 8260
              </a>.
            </p>
          </div>
        </div>
      </section>

      {/* JOIN SUB-COMMITTEE MODAL */}
      <AnimatePresence>
        {selectedCommittee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeJoinModal}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 my-auto text-white"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
                    style={{ backgroundColor: selectedCommittee.accentColor }}
                  >
                    <SafeIcon icon={selectedCommittee.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Sub-Committee Selection
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                      {selectedCommittee.name}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeJoinModal}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 sm:p-8 space-y-6">
                {restrictionData ? (
                  /* Access Restricted Screen (Tier 1 / Tier 2 Intercept) */
                  <div className="space-y-6">
                    <div className="p-5 sm:p-6 bg-red-950/40 border border-red-800/80 rounded-2xl space-y-4">
                      <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center shadow-inner">
                        <SafeIcon icon={FiLock} className="w-6 h-6" />
                      </div>

                      <div className="space-y-1.5">
                        <div className="text-xs font-bold uppercase tracking-wider text-red-400">
                          Access Restricted • Tier 3 Only
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
                          Sub-Committees are Reserved for Tier 3 Strategic Leaders
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {restrictionData.message}
                        </p>
                      </div>

                      <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-300">
                        <div className="font-semibold text-slate-200 flex items-center justify-between">
                          <span>Your Verified Status:</span>
                          <span className="text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                            {restrictionData.currentTierLabel || 'Tier 1 / Tier 2'}
                          </span>
                        </div>
                        <p className="leading-relaxed text-slate-400 pt-1">
                          Sub-committees are specialized operational teams that drive national strategy, requiring 70% meeting involvement. They are not open to Tier 1 Advocates or Tier 2 Champions.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <a
                        href={`mailto:admin@doright.ng?subject=Tier%203%20Advancement%20Request%20-%20${encodeURIComponent(formData.membershipId || formData.email)}&body=Dear%20DRAI%20Admin%2C%0A%0AI%20am%20interested%20in%20advancing%20to%20Tier%203%20(Strategic%20Leader)%20in%20order%20to%20serve%20in%20the%20${encodeURIComponent(selectedCommittee.name)}.%0A%0AMy%20Membership%20ID%3A%20${encodeURIComponent(formData.membershipId)}%0AName%3A%20${encodeURIComponent(formData.fullName)}%0AEmail%3A%20${encodeURIComponent(formData.email)}`}
                        className="w-full py-3.5 px-6 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg active:scale-95 inline-flex items-center justify-center gap-2"
                      >
                        <SafeIcon icon={FiMail} className="w-4 h-4" />
                        <span>Email Admin to Request Tier 3 Advancement</span>
                      </a>

                      <a
                        href="https://wa.me/2349123399968?text=Hello%20DRAI%20Admin%2C%20I%20would%20like%20to%20inquire%20about%20advancing%20my%20membership%20to%20Tier%203%20to%20join%20a%20sub-committee."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 px-4 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] font-semibold rounded-xl text-xs transition-colors inline-flex items-center justify-center gap-2"
                      >
                        <SafeIcon icon={FaWhatsapp} className="w-4 h-4" />
                        <span>Chat with Admin on WhatsApp (+234 912 339 9968)</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => setRestrictionData(null)}
                        className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                      >
                        Re-enter Details with Another Membership ID
                      </button>
                    </div>
                  </div>
                ) : !isJoined ? (
                  /* Form State */
                  <form onSubmit={handleJoinSubmit} className="space-y-4 sm:space-y-5" noValidate>
                    {/* Tier 3 Exclusivity Notice Banner */}
                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs text-amber-300 leading-relaxed">
                      <SafeIcon icon={FiShield} className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-400">Tier 3 Exclusivity Notice:</strong> Sub-committees are exclusively for verified Tier 3 Strategic Leaders. Enter your Membership ID below to verify your standing.
                      </div>
                    </div>

                    {/* Membership ID */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Membership ID <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <SafeIcon icon={FiAward} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                        <input
                          type="text"
                          name="membershipId"
                          required
                          value={formData.membershipId}
                          onChange={handleInputChange}
                          placeholder="e.g. DRAI-2026-1234"
                          className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white uppercase placeholder:normal-case placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm font-mono tracking-wide"
                        />
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Found on your virtual Advocacy Card or onboarding confirmation email.
                      </span>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <SafeIcon icon={FiUser} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="e.g. Jane Doe"
                          className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Registered Email */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Registered Email <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <SafeIcon icon={FiMail} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="name@example.com"
                            className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>

                      {/* WhatsApp Phone */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          WhatsApp Phone Number
                        </label>
                        <div className="relative">
                          <SafeIcon icon={FiPhone} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+234..."
                            className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {joinError && (
                      <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-xs flex items-start gap-2 leading-relaxed">
                        <SafeIcon icon={FiAlertCircle} className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <span>{joinError}</span>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 px-6 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-amber-400/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <>
                            <SafeIcon icon={FiLoader} className="w-4 h-4 animate-spin" />
                            <span>Verifying Tier 3 Standing...</span>
                          </>
                        ) : (
                          <>
                            <span>Verify &amp; Join {selectedCommittee.shortName}</span>
                            <SafeIcon icon={FiArrowRight} className="w-4 h-4 stroke-[2.5]" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Confirmation & Welcome Screen (Exact Text from Directive) */
                  <div className="space-y-6">
                    <div className="p-5 sm:p-6 bg-emerald-950/40 border border-emerald-800/80 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center shadow-inner">
                          <SafeIcon icon={FiCheckCircle} className="w-7 h-7" />
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                          <SafeIcon icon={FiShield} className="w-3.5 h-3.5" />
                          <span>Tier 3 Strategic Leader • {verifiedMember?.membership_id || formData.membershipId}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
                          Welcome, {verifiedMember?.full_name || formData.fullName}! Thank you for stepping up to serve in the {selectedCommittee.name}!
                        </h4>
                        <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
                          Your role as a Tier 3 Strategic Leader is vital to driving our operational goals and delivering national impact.
                        </p>
                      </div>

                      {/* Key Expectations */}
                      <div className="p-4 bg-slate-950/70 border border-emerald-800/50 rounded-xl space-y-2 text-xs sm:text-sm text-slate-200">
                        <div className="font-bold text-amber-400 flex items-center gap-1.5">
                          <span>📌 Key Expectations:</span>
                        </div>
                        <ul className="space-y-1.5 pl-4 list-disc text-slate-300">
                          <li>Maintain at least a 70% attendance rate at sub-committee meetings.</li>
                          <li>Deliver on your assigned tasks and sub-committee activities on time.</li>
                          <li>Actively collaborate with fellow team members to advance our goals.</li>
                        </ul>
                      </div>

                      <p className="text-xs text-emerald-300 font-medium leading-relaxed">
                        Thank you for bringing your expertise and dedication to the team. Let's make doing the right thing standard practice everywhere!
                      </p>
                    </div>

                    {/* WhatsApp Action Button */}
                    <div className="space-y-3">
                      <a
                        href={activeWhatsAppLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3.5 px-6 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-green-500/20 active:scale-95 inline-flex items-center justify-center gap-2.5"
                      >
                        <SafeIcon icon={FaWhatsapp} className="w-5 h-5 text-white" />
                        <span>Join {selectedCommittee.shortName} WhatsApp Group</span>
                        <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
                      </a>

                      <button
                        type="button"
                        onClick={closeJoinModal}
                        className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                      >
                        Done / Return to Sub-Committees
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubCommittees;
