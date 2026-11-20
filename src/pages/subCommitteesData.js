import * as FiIcons from 'react-icons/fi';

const { FiFileText, FiDollarSign, FiCompass, FiBookOpen, FiVideo, FiCast } = FiIcons;

// Ids, numbers, icons, colours and WhatsApp links live in code; the CMS only edits the copy (see
// src/cms/pages/subcommittees.config.js). Lives in its own module so CMS sections can import it
// without a circular import through the page.
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
