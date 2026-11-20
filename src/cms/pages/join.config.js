import JoinHero from '../sections/join/JoinHero';
import JoinWays from '../sections/join/JoinWays';
import JoinFormIntro from '../sections/join/JoinFormIntro';
import JoinImpactStats from '../sections/join/JoinImpactStats';
import JoinEveryAction from '../sections/join/JoinEveryAction';
import { JOIN_WAYS } from '../sections/join/waysData';
import { fixedListField } from '../fields/fixedList';
import { textField, textareaField, buttonField, hiddenField } from '../fields/common';

const SETTINGS_NOTE = 'Contact details come from Admin → Settings';

// Defaults are today's copy; interestKey, icon and colour stay in code.
const WAY_COPY = JOIN_WAYS.map(({ interestKey, title, description, features, ctaText }) => ({
  interestKey,
  title,
  description,
  features: features.map((text) => ({ text })),
  ctaText,
}));

const joinConfig = {
  order: ['JoinHero', 'JoinWays', 'JoinFormIntro', 'JoinImpactStats', 'JoinEveryAction'],
  root: {
    fields: {
      seoTitle: textField('Page title (shown in Google and the browser tab)'),
      seoDescription: textareaField('Page description (shown in Google results)'),
    },
    defaultProps: {
      seoTitle: 'Join The Movement',
      seoDescription:
        'Get involved with DoRight Awareness Initiative — volunteer, donate, or partner with us to help build a more accountable Nigeria.',
    },
  },
  components: {
    JoinHero: {
      label: 'Hero',
      fields: {
        title: textField('Heading'),
        subtitle: textareaField('Intro text'),
        applyLabel: textField('Apply button text (opens the signup form)'),
        exploreLabel: textField('Explore button text (scrolls to the ways list)'),
        // No "hidden" toggle: the transparent site header needs the dark hero behind it on "/join".
      },
      defaultProps: {
        title: 'Join the Movement',
        subtitle:
          'Become part of a growing community of Nigerians committed to building a more transparent, accountable, and integrity-driven society. Together, we can create lasting change.',
        applyLabel: 'Apply to Join',
        exploreLabel: 'Explore Opportunities',
      },
      render: JoinHero,
    },
    JoinWays: {
      label: 'Ways to get involved (edit only: no add, remove or reorder)',
      fields: {
        heading: textField('Heading'),
        subtitle: textareaField('Intro text'),
        ways: fixedListField({
          label: 'Ways (text only; the form option, icon and colour are fixed)',
          count: JOIN_WAYS.length,
          key: 'interestKey',
          itemLabel: 'title',
          arrayFields: {
            title: textField('Title'),
            description: textareaField('Description'),
            features: {
              type: 'array',
              label: 'Features',
              getItemSummary: (item) => item.text || 'Feature',
              defaultItemProps: { text: '' },
              arrayFields: { text: textField('Feature') },
            },
            ctaText: textField('Button text'),
          },
        }),
        hidden: hiddenField,
      },
      defaultProps: {
        heading: 'Ways to Get Involved',
        subtitle:
          "Choose how you'd like to contribute to building a better Nigeria. Every form of support makes a meaningful difference.",
        ways: WAY_COPY,
        hidden: false,
      },
      render: JoinWays,
    },
    JoinFormIntro: {
      label: `Questions and form prompt (${SETTINGS_NOTE})`,
      fields: {
        badge: textField('Badge text'),
        heading: textField('Heading'),
        text: textareaField('Text'),
        emailHeading: textField(`Email heading (${SETTINGS_NOTE})`),
        callHeading: textField(`Phone heading (${SETTINGS_NOTE})`),
        visitHeading: textField(`Address heading (${SETTINGS_NOTE})`),
        cardHeading: textField('Form card heading'),
        cardText: textareaField('Form card text'),
        cardButtonLabel: textField('Form card button text (opens the signup form)'),
        hidden: hiddenField,
      },
      defaultProps: {
        badge: 'Have Questions?',
        heading: 'Connect With Our Team',
        text: 'Want to learn more before applying or need assistance with your application? Reach out to us directly or visit our office.',
        emailHeading: 'Email Us',
        callHeading: 'Call Us',
        visitHeading: 'Visit Us',
        cardHeading: 'Ready to Make an Impact?',
        cardText: 'Fill out our brief form and our team will get back to you promptly.',
        cardButtonLabel: 'Open Application Form',
        hidden: false,
      },
      render: JoinFormIntro,
    },
    JoinImpactStats: {
      label: 'Impact stats',
      fields: {
        heading: textField('Heading'),
        subtitle: textareaField('Intro text'),
        stats: {
          type: 'array',
          label: 'Stats',
          getItemSummary: (item) => `${item.number || ''} ${item.label || 'Stat'}`.trim(),
          defaultItemProps: { number: '', label: 'New stat' },
          arrayFields: { number: textField('Number'), label: textField('Label') },
        },
        hidden: hiddenField,
      },
      defaultProps: {
        heading: 'Our Growing Impact',
        subtitle: 'See how our community is making a difference across Nigeria',
        stats: [
          { number: '500+', label: 'Active Volunteers' },
          { number: '₦50M+', label: 'Funds Raised' },
          { number: '25+', label: 'Partner Organizations' },
          { number: '100+', label: 'Communities Impacted' },
        ],
        hidden: false,
      },
      render: JoinImpactStats,
    },
    JoinEveryAction: {
      label: 'Every action counts',
      fields: {
        heading: textField('Heading'),
        text: textareaField('Text'),
        primaryLabel: textField('Primary button text (opens the signup form)'),
        secondaryButton: buttonField('Secondary button'),
        hidden: hiddenField,
      },
      defaultProps: {
        heading: 'Every Action Counts',
        text: 'Whether you volunteer an hour a week, partner with us, or donate monthly, your contribution helps build a Nigeria where integrity thrives.',
        primaryLabel: 'Start Volunteering',
        secondaryButton: { label: 'Sponsor / Make a Payment', href: '/pay' },
        hidden: false,
      },
      render: JoinEveryAction,
    },
  },
};

export default joinConfig;
