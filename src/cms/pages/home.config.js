import HomeHero from '../sections/home/HomeHero';
import HomeWhoWeAre from '../sections/home/HomeWhoWeAre';
import HomePrograms from '../sections/home/HomePrograms';
import HomeCallToAction from '../sections/home/HomeCallToAction';
import { imageField } from '../fields/imageField';
import { iconField } from '../fields/iconField';
import { textField, textareaField, buttonField, hiddenField } from '../fields/common';

const S3 = 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com';

const homeConfig = {
  order: ['HomeHero', 'HomeWhoWeAre', 'HomePrograms', 'HomeCallToAction'],
  root: {
    fields: {
      seoTitle: textField('Page title (shown in Google and the browser tab)'),
      seoDescription: textareaField('Page description (shown in Google results)'),
    },
    defaultProps: {
      seoTitle: 'Integrity, Leadership, Civic Responsibility',
      seoDescription:
        'DoRight Awareness Initiative promotes integrity, accountability, and civic responsibility across Nigeria through community campaigns, public education, and skills training.',
    },
  },
  components: {
    HomeHero: {
      label: 'Hero slideshow',
      fields: {
        slides: {
          type: 'array',
          label: 'Slides',
          getItemSummary: (item) => item.headline || 'Slide',
          defaultItemProps: { image: { url: '', alt: '' }, badge: '', headline: 'New slide', headlineAccent: '', subtext: '' },
          arrayFields: {
            image: imageField('Background image'),
            badge: textField('Badge'),
            headline: textField('Headline'),
            headlineAccent: textField('Headline (gold part)'),
            subtext: textareaField('Subtext'),
          },
        },
        primaryButton: buttonField('Main button'),
        secondaryButton: buttonField('Second button'),
        hidden: hiddenField,
      },
      defaultProps: {
        slides: [
          {
            image: { url: `${S3}/1759570847937-Do-right-awarenss-initiative-school-project-6-scaled-2%20%281%29.jpg`, alt: 'DRAI educator engaging with students in classroom' },
            badge: 'Promoting Integrity & Civic Responsibility',
            headline: 'Building a Nigeria That',
            headlineAccent: 'Does Right',
            subtext: 'Empower. Educate. Transform. Join the movement to promote integrity, accountability, and civic responsibility across communities.',
          },
          {
            image: { url: `${S3}/1759570856796-Do-right-awarenss-initiative-school-project-6-scaled-2.jpg`, alt: 'Students learning about integrity and civic responsibility' },
            badge: 'Youth Mentorship',
            headline: 'Empowering',
            headlineAccent: "Tomorrow's Leaders",
            subtext: 'We mentor young Nigerians through workshops and hands-on programs that build the confidence and skills to lead with integrity.',
          },
          {
            image: { url: `${S3}/1759570877162-Capture.PNG`, alt: 'Group of students with DRAI educational materials' },
            badge: 'Community-Led Change',
            headline: 'Communities Driving Their',
            headlineAccent: 'Own Transformation',
            subtext: 'From grassroots campaigns to policy advocacy, real change starts with the people closest to the problem.',
          },
        ],
        primaryButton: { label: 'Join The Movement', href: '/join' },
        secondaryButton: { label: 'Explore Programs', href: '/programs' },
        hidden: false,
      },
      render: HomeHero,
    },
    HomeWhoWeAre: {
      label: 'Who We Are',
      fields: {
        heading: textField('Heading'),
        paragraphs: {
          type: 'array',
          label: 'Paragraphs',
          getItemSummary: (item) => (item.text || 'Paragraph').slice(0, 40),
          defaultItemProps: { text: '' },
          arrayFields: { text: textareaField('Text') },
        },
        button: buttonField('Button'),
        image: imageField('Image'),
        imageCaptionTitle: textField('Image caption title'),
        imageCaptionText: textareaField('Image caption text'),
        hidden: hiddenField,
      },
      defaultProps: {
        heading: 'Who We Are',
        paragraphs: [
          { text: "Doing Right Awareness Initiative (DRAI) is a non-profit movement championing integrity, accountability, and civic responsibility across Nigeria. Through public campaigns, comprehensive training programs, and community-led action, we're building a culture where doing the right thing is the norm, not the exception." },
          { text: 'Our approach combines grassroots mobilization with evidence-based advocacy, creating sustainable change from the ground up while engaging with policy makers and institutions at the highest levels.' },
        ],
        button: { label: 'Learn More About Our Work', href: '/programs' },
        image: { url: `${S3}/1759575546536-DSC_0360-scaled-2-1536x1024.jpg`, alt: 'DRAI team members working together' },
        imageCaptionTitle: 'Our Dedicated Team',
        imageCaptionText: "Meet the passionate individuals behind DRAI's mission to promote integrity and civic responsibility across Nigerian communities.",
        hidden: false,
      },
      render: HomeWhoWeAre,
    },
    HomePrograms: {
      label: 'Our Programs',
      fields: {
        heading: textField('Heading'),
        intro: textareaField('Intro'),
        cards: {
          type: 'array',
          label: 'Program cards',
          getItemSummary: (item) => item.title || 'Program',
          defaultItemProps: { icon: 'FiStar', title: 'New program', description: '' },
          arrayFields: {
            icon: iconField('Icon'),
            title: textField('Title'),
            description: textareaField('Description'),
          },
        },
        cardLinkLabel: textField('Card link text'),
        cardLinkHref: textField('Card link (e.g. /programs)'),
        hidden: hiddenField,
      },
      defaultProps: {
        heading: 'Our Programs',
        intro: 'Comprehensive initiatives designed to create lasting change through education, advocacy, and community engagement.',
        cards: [
          { icon: 'FiUsers', title: 'Youth Mentorship', description: "Empowering young leaders through mentorship and workshops for tomorrow's integrity champions." },
          { icon: 'FiTarget', title: 'Community Campaigns', description: 'Local projects promoting accountability, transparency, and civic pride in communities.' },
          { icon: 'FiTrendingUp', title: 'Policy Advocacy', description: 'Research-driven engagement with stakeholders to create systemic change and reform.' },
          { icon: 'FiShield', title: 'Monitoring & Reporting', description: 'Tools and platforms for citizens to report issues and ensure proper follow-up.' },
        ],
        cardLinkLabel: 'Learn More',
        cardLinkHref: '/programs',
        hidden: false,
      },
      render: HomePrograms,
    },
    HomeCallToAction: {
      label: 'Take Action (closing banner)',
      fields: {
        heading: textField('Heading'),
        text: textareaField('Text'),
        primaryButton: buttonField('Main button'),
        secondaryButton: buttonField('Second button'),
        hidden: hiddenField,
      },
      defaultProps: {
        heading: 'Take Action Today',
        text: "Be part of building a more transparent, accountable, and integrity-driven Nigeria. Every action counts toward the change we're working to create.",
        primaryButton: { label: 'Join The Movement', href: '/join' },
        secondaryButton: { label: 'Partner With Us', href: '/contact' },
        hidden: false,
      },
      render: HomeCallToAction,
    },
  },
};

export default homeConfig;
