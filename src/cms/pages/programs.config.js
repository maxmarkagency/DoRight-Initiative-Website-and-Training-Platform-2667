import ProgramsHero from '../sections/programs/ProgramsHero';
import ProgramsImpactStats from '../sections/programs/ProgramsImpactStats';
import ProgramsList from '../sections/programs/ProgramsList';
import ProgramsHowWeWork from '../sections/programs/ProgramsHowWeWork';
import ProgramsRealImpact from '../sections/programs/ProgramsRealImpact';
import ProgramsGetInvolved from '../sections/programs/ProgramsGetInvolved';
import { imageField } from '../fields/imageField';
import { iconField } from '../fields/iconField';
import { textField, textareaField, buttonField, hiddenField } from '../fields/common';

const S3 = 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/';
const items = (...texts) => texts.map((text) => ({ text }));

const bulletsField = (label) => ({
  type: 'array',
  label,
  getItemSummary: (item) => item.text || 'Item',
  defaultItemProps: { text: '' },
  arrayFields: { text: textField('Text') },
});

const blockFields = (name) => ({
  type: 'object',
  label: name,
  objectFields: {
    title: textField('Title'),
    text: textareaField('Text'),
    bullets: bulletsField('Bullet points'),
    image: imageField('Photo (optional)'),
  },
});

const programsConfig = {
  order: ['ProgramsHero', 'ProgramsImpactStats', 'ProgramsList', 'ProgramsHowWeWork', 'ProgramsRealImpact', 'ProgramsGetInvolved'],
  root: {
    fields: {
      seoTitle: textField('Page title (shown in Google and the browser tab)'),
      seoDescription: textareaField('Page description (shown in Google results)'),
    },
    defaultProps: {
      seoTitle: 'Our Programs',
      seoDescription:
        "Explore DRAI's programs: youth mentorship, community campaigns, policy advocacy, and educational outreach driving integrity and accountability across Nigeria.",
    },
  },
  components: {
    ProgramsHero: {
      label: 'Hero',
      fields: {
        title: textField('Heading'),
        text: textareaField('Intro text'),
        // No "hidden" toggle: the transparent site header needs the dark hero behind it on "/programs".
      },
      defaultProps: {
        title: 'Our Programs',
        text: 'Comprehensive community-led solutions designed to promote integrity, accountability, and civic responsibility across Nigeria through education, advocacy, and grassroots action.',
      },
      render: ProgramsHero,
    },
    ProgramsImpactStats: {
      label: 'Impact numbers',
      fields: {
        stats: {
          type: 'array',
          label: 'Stats',
          getItemSummary: (item) => item.label || 'Stat',
          defaultItemProps: { number: '0', label: 'New stat' },
          arrayFields: { number: textField('Number'), label: textField('Label') },
        },
        hidden: hiddenField,
      },
      defaultProps: {
        stats: [
          { number: '5,000+', label: 'Citizens Engaged' },
          { number: '50+', label: 'Communities Reached' },
          { number: '100+', label: 'Leaders Trained' },
          { number: '25+', label: 'Policy Changes Influenced' },
        ],
        hidden: false,
      },
      render: ProgramsImpactStats,
    },
    ProgramsList: {
      label: 'Programs',
      fields: {
        programs: {
          type: 'array',
          label: 'Programs',
          getItemSummary: (item) => item.title || 'Program',
          defaultItemProps: { icon: 'FiTarget', title: 'New program', subtitle: '', description: '', features: [], image: { url: '', alt: '' } },
          arrayFields: {
            icon: iconField('Icon'),
            title: textField('Title'),
            subtitle: textField('Subtitle'),
            description: textareaField('Description'),
            features: bulletsField('Feature list'),
            image: imageField('Photo'),
          },
        },
        hidden: hiddenField,
      },
      defaultProps: {
        programs: [
          {
            icon: 'FiUsers',
            title: 'Youth Mentorship',
            subtitle: 'Leadership for Tomorrow',
            description: 'Empowering the next generation of integrity champions through comprehensive mentorship programs, leadership workshops, and peer-led community projects in schools across Nigeria.',
            features: items('Interactive classroom sessions', 'One-on-one mentorship pairing', 'Student leadership development', 'Character building workshops', 'Peer-to-peer learning networks'),
            image: { url: `${S3}1759595241762-Do-right-awarenss-initiative-school-project-7-scaled-2-1536x1024.jpg`, alt: 'Youth Mentorship' },
          },
          {
            icon: 'FiTarget',
            title: 'Community Campaigns',
            subtitle: 'Local Action for Change',
            description: 'Grassroots mobilization initiatives that promote civic awareness, accountability, and community pride through targeted campaigns and local projects.',
            features: items('Community awareness campaigns', 'Door-to-door civic education', 'Local government engagement sessions', 'Volunteer coordination and training', 'Public accountability forums'),
            image: { url: `${S3}1759595235026-Do-right-awarenss-initiative-school-project-9-scaled-2-1536x1024.jpg`, alt: 'Community Campaigns' },
          },
          {
            icon: 'FiTrendingUp',
            title: 'Policy Advocacy',
            subtitle: 'Systemic Change Through Research',
            description: 'Evidence-based policy research and strategic engagement with stakeholders to create lasting institutional reforms and systemic improvements.',
            features: items('Policy research and analysis', 'Stakeholder engagement sessions', 'Legislative advocacy', 'Reform implementation monitoring', 'Coalition building with partners'),
            image: { url: `${S3}1759595248284-Do-right-awarenss-initiative-school-project-13-scaled-2-1536x1024.jpg`, alt: 'Policy Advocacy' },
          },
          {
            icon: 'FiShield',
            title: 'Educational Outreach',
            subtitle: 'Knowledge Sharing & Resource Distribution',
            description: 'Comprehensive educational initiatives that provide learning materials, resources, and direct support to schools and communities across Nigeria.',
            features: items('Educational resource distribution', 'School partnership programs', 'Teacher training workshops', 'Student scholarship support', 'Community learning centers'),
            image: { url: `${S3}1759595280475-Do-right-awarenss-initiative-school-project-10-scaled-2-1536x1024.jpg`, alt: 'Educational Outreach' },
          },
        ],
        hidden: false,
      },
      render: ProgramsList,
    },
    ProgramsHowWeWork: {
      label: 'How we work',
      fields: {
        title: textField('Heading'),
        text: textareaField('Intro text'),
        items: {
          type: 'array',
          label: 'Approach cards',
          getItemSummary: (item) => item.title || 'Card',
          defaultItemProps: { icon: 'FiTarget', title: 'New card', description: '' },
          arrayFields: { icon: iconField('Icon'), title: textField('Title'), description: textareaField('Description') },
        },
        hidden: hiddenField,
      },
      defaultProps: {
        title: 'How We Create Change',
        text: 'Our integrated approach combines community mobilization with institutional engagement, creating sustainable change from the grassroots up while influencing policy at the highest levels.',
        items: [
          { icon: 'FiUsers', title: 'Community Engagement', description: 'We start at the grassroots level,working directly with communities to identify challenges and build local capacity for change.' },
          { icon: 'FiTarget', title: 'Evidence-Based Advocacy', description: 'Our research and data collection inform targeted advocacy efforts that address systemic issues and promote policy reform.' },
          { icon: 'FiTrendingUp', title: 'Sustainable Impact', description: 'We measure outcomes and adapt our strategies to ensure lasting change that communities can maintain and expand.' },
        ],
        hidden: false,
      },
      render: ProgramsHowWeWork,
    },
    ProgramsRealImpact: {
      label: 'Real programs, real impact',
      fields: {
        title: textField('Heading'),
        text: textareaField('Intro text'),
        classroom: blockFields('Left block (classroom)'),
        community: blockFields('Right block (community)'),
        hidden: hiddenField,
      },
      defaultProps: {
        title: 'Real Programs,Real Impact',
        text: 'These images showcase our actual work in Nigerian schools and communities - from classroom mentorship sessions to community outreach programs and educational resource distribution.',
        classroom: {
          title: 'In the Classroom',
          text: 'Our educators work directly with students in their learning environments,fostering discussions about integrity,leadership,and civic responsibility through interactive sessions and practical exercises.',
          bullets: items('Direct student engagement in schools', 'Interactive integrity workshops', 'Character development programs', 'Peer learning facilitation'),
          image: { url: '', alt: '' },
        },
        community: {
          title: 'In the Community',
          text: 'Beyond the classroom,we engage with community members,distribute educational resources,and create platforms for dialogue about accountability and positive change in local governance.',
          bullets: items('Community dialogue sessions', 'Educational resource distribution', 'Local partnership building', 'Civic engagement training'),
          image: { url: '', alt: '' },
        },
        hidden: false,
      },
      render: ProgramsRealImpact,
    },
    ProgramsGetInvolved: {
      label: 'Get involved',
      fields: {
        heading: textField('Heading'),
        text: textareaField('Text'),
        primaryButton: buttonField('Main button'),
        secondaryButton: buttonField('Second button'),
        hidden: hiddenField,
      },
      defaultProps: {
        heading: 'Get Involved in Our Programs',
        text: "Whether you're interested in volunteering,partnering with us,or starting a program in your community,we'd love to work with you.",
        primaryButton: { label: 'Volunteer Now', href: '/join' },
        secondaryButton: { label: 'Partner With Us', href: '/join' },
        hidden: false,
      },
      render: ProgramsGetInvolved,
    },
  },
};

export default programsConfig;
