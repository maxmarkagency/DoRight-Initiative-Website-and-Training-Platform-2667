import AboutHero from '../sections/about/AboutHero';
import AboutMissionVision from '../sections/about/AboutMissionVision';
import AboutValues from '../sections/about/AboutValues';
import AboutImpact from '../sections/about/AboutImpact';
import AboutTimeline from '../sections/about/AboutTimeline';
import AboutTeam from '../sections/about/AboutTeam';
import AboutCallToAction from '../sections/about/AboutCallToAction';
import { imageField } from '../fields/imageField';
import { iconField } from '../fields/iconField';
import { textField, textareaField, buttonField, hiddenField } from '../fields/common';

const statFields = {
  number: textField('Number'),
  suffix: textField('Suffix (e.g. +)'),
  label: textField('Label'),
};

const statsField = (label) => ({
  type: 'array',
  label,
  getItemSummary: (item) => item.label || 'Stat',
  defaultItemProps: { number: '0', suffix: '+', label: 'New stat' },
  arrayFields: statFields,
});

const STATS = [
  { number: '6', suffix: '+', label: 'Years of Impact' },
  { number: '15', suffix: '+', label: 'States Reached' },
  { number: '5000', suffix: '+', label: 'Citizens Trained' },
  { number: '25', suffix: '+', label: 'Policy Reforms' },
];

const aboutConfig = {
  order: ['AboutHero', 'AboutMissionVision', 'AboutValues', 'AboutImpact', 'AboutTimeline', 'AboutTeam', 'AboutCallToAction'],
  root: {
    fields: {
      seoTitle: textField('Page title (shown in Google and the browser tab)'),
      seoDescription: textareaField('Page description (shown in Google results)'),
    },
    defaultProps: {
      seoTitle: 'About Us — Our Story',
      seoDescription:
        'Learn about Doing Right Awareness Initiative (DRAI): a Nigerian non-profit championing integrity, accountability, and civic responsibility since 2018.',
    },
  },
  components: {
    AboutHero: {
      label: 'Hero',
      fields: {
        badge: textField('Badge'),
        heading: textField('Heading'),
        headingAccent: textField('Heading (gold underlined part)'),
        text: textareaField('Intro text'),
        stats: statsField('Stats (first three are shown)'),
        // No "hidden" toggle: the transparent site header needs the dark hero behind it on "/about".
      },
      defaultProps: {
        badge: 'Our Story',
        heading: 'About DRAI',
        headingAccent: 'DRAI',
        text: 'We are a movement of Nigerian citizens committed to building a culture of integrity, accountability, and civic responsibility across our nation.',
        stats: STATS,
      },
      render: AboutHero,
    },
    AboutMissionVision: {
      label: 'Mission & Vision',
      fields: {
        missionTitle: textField('Mission title'),
        missionText: textareaField('Mission text'),
        visionTitle: textField('Vision title'),
        visionText: textareaField('Vision text'),
        hidden: hiddenField,
      },
      defaultProps: {
        missionTitle: 'Our Mission',
        missionText:
          'To promote integrity, accountability, and civic responsibility across Nigeria through education, advocacy, and community-led action, creating sustainable change from the grassroots up. We believe that lasting transformation comes from empowering citizens with the knowledge, tools, and networks needed to demand and create positive change in their communities.',
        visionTitle: 'Our Vision',
        visionText:
          'A Nigeria where integrity is the norm, where citizens actively participate in governance, and where transparent, accountable leadership drives sustainable development for all. We envision communities empowered to hold their leaders accountable, institutions that serve the public interest, and a culture where doing right is celebrated and rewarded.',
        hidden: false,
      },
      render: AboutMissionVision,
    },
    AboutValues: {
      label: 'Core values',
      fields: {
        title: textField('Heading'),
        subtitle: textareaField('Subheading'),
        values: {
          type: 'array',
          label: 'Values',
          getItemSummary: (item) => item.title || 'Value',
          defaultItemProps: { icon: 'FiStar', title: 'New value', description: '' },
          arrayFields: {
            icon: iconField('Icon'),
            title: textField('Title'),
            description: textareaField('Description'),
          },
        },
        hidden: hiddenField,
      },
      defaultProps: {
        title: 'Our Core Values',
        subtitle: 'These values guide everything we do and shape how we work with communities across Nigeria.',
        values: [
          { icon: 'FiCheckCircle', title: 'Integrity', description: 'Being honest, telling the truth and consistently upholding strong moral values and ethical standards.' },
          { icon: 'FiTrendingUp', title: 'Diligence', description: 'Working steadily and earnestly, and persevering until the goal is achieved.' },
          { icon: 'FiUsers', title: 'Respect', description: 'Showing due regard for the feelings, wishes and rights of others.' },
          { icon: 'FiHeart', title: 'Compassion', description: 'Recognising when others are in distress or suffering and taking action to help them.' },
          { icon: 'FiShield', title: 'Justice', description: 'Acting fairly and upholding what is morally right, both in how we treat people and in the causes we support.' },
          { icon: 'FiZap', title: 'Courage', description: 'Choosing to face pain, danger, uncertainty or intimidation in pursuit of a worthy goal.' },
          { icon: 'FiAward', title: 'Meritocracy', description: 'Building a society that values excellence, selects the most competent people for leadership and holds them accountable to the highest standards.' },
        ],
        hidden: false,
      },
      render: AboutValues,
    },
    AboutImpact: {
      label: 'Impact numbers',
      fields: {
        title: textField('Heading'),
        subtitle: textareaField('Subheading'),
        stats: statsField('Stats'),
        hidden: hiddenField,
      },
      defaultProps: {
        title: 'Our Impact Since 2018',
        subtitle: 'Measurable results from our commitment to building integrity and accountability across Nigeria.',
        stats: STATS,
        hidden: false,
      },
      render: AboutImpact,
    },
    AboutTimeline: {
      label: 'Timeline',
      fields: {
        title: textField('Heading'),
        subtitle: textareaField('Subheading'),
        items: {
          type: 'array',
          label: 'Milestones',
          getItemSummary: (item) => `${item.year} ${item.title}`.trim() || 'Milestone',
          defaultItemProps: { year: '', title: 'New milestone', description: '' },
          arrayFields: {
            year: textField('Year'),
            title: textField('Title'),
            description: textareaField('Description'),
          },
        },
        hidden: hiddenField,
      },
      defaultProps: {
        title: 'Our Journey',
        subtitle: 'Key milestones in our mission to promote integrity and accountability across Nigeria.',
        items: [
          { year: '2018', title: 'Foundation', description: 'Doing Right Awareness Initiative (DRAI) was founded by a group of passionate Nigerian citizens committed to promoting integrity and accountability.' },
          { year: '2019', title: 'First Community Programs', description: 'Launched our first youth mentorship programs in Lagos and Abuja, reaching over 500 young leaders.' },
          { year: '2020', title: 'Digital Expansion', description: 'Developed our first online training platform and launched digital reporting tools for citizens.' },
          { year: '2021', title: 'National Reach', description: 'Expanded operations to 15 states across Nigeria, establishing local chapters and partnerships.' },
          { year: '2022', title: 'Policy Impact', description: 'Our advocacy efforts contributed to 12 policy reforms at local and state government levels.' },
          { year: '2024', title: 'Comprehensive Platform', description: 'Launched our complete training and certification system, serving over 5,000 active learners.' },
        ],
        hidden: false,
      },
      render: AboutTimeline,
    },
    AboutTeam: {
      label: 'Team',
      fields: {
        title: textField('Heading'),
        subtitle: textareaField('Subheading'),
        image: imageField('Team photo'),
        photoTitle: textField('Photo caption title'),
        photoText: textareaField('Photo caption text'),
        hidden: hiddenField,
      },
      defaultProps: {
        title: 'Meet Our Team',
        subtitle: "The passionate individuals behind DRAI's mission to promote integrity and accountability across Nigeria.",
        image: {
          url: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759575290797-DSC_0360-scaled-2-1536x1024.jpg',
          alt: 'DRAI team members in matching uniforms',
        },
        photoTitle: 'Meet Our Team',
        photoText: "Meet the passionate DRAI team members who work tirelessly to promote integrity and civic responsibility across Nigerian communities. Together, we're building a movement that transforms lives and strengthens democracy.",
        hidden: false,
      },
      render: AboutTeam,
    },
    AboutCallToAction: {
      label: 'Call to action',
      fields: {
        heading: textField('Heading'),
        text: textareaField('Text'),
        primaryButton: buttonField('Main button'),
        secondaryButton: buttonField('Second button'),
        hidden: hiddenField,
      },
      defaultProps: {
        heading: 'Join Our Mission',
        text: 'Be part of building a Nigeria where integrity thrives and accountability is the standard.',
        primaryButton: { label: 'Get Involved', href: '/join' },
        secondaryButton: { label: 'Explore Programs', href: '/programs' },
        hidden: false,
      },
      render: AboutCallToAction,
    },
  },
};

export default aboutConfig;
