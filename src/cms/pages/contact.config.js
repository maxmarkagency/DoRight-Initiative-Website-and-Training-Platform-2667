import ContactHero from '../sections/contact/ContactHero';
import ContactInfoIntro from '../sections/contact/ContactInfoIntro';
import ContactFormIntro from '../sections/contact/ContactFormIntro';
import ContactMap from '../sections/contact/ContactMap';
import ContactFaq from '../sections/contact/ContactFaq';
import { textField, textareaField, hiddenField } from '../fields/common';

const SETTINGS_NOTE = 'Contact details come from Admin → Settings';

const DEPARTMENTS = [
  { name: 'General Inquiries', email: 'info@doright.ng', description: 'General questions about our organization and programs' },
  { name: 'Partnerships', email: 'partnerships@doright.ng', description: 'Collaboration opportunities and strategic partnerships' },
  { name: 'Volunteer Coordination', email: 'volunteer@doright.ng', description: 'Volunteer opportunities and community engagement' },
  { name: 'Media & Press', email: 'media@doright.ng', description: 'Press inquiries and media relations' },
];

const FAQS = [
  { question: 'How can I volunteer with DoRight?', answer: 'You can apply to volunteer through our Join page or contact our volunteer coordinator directly. We offer flexible opportunities that match your skills and availability.' },
  { question: 'How can I become an official DoRight Advocate?', answer: 'Anyone committed to uprightness can join as a Tier 1 Personal Advocate through our Join Us page, instantly receive an official digital membership card, and join our active community.' },
  { question: 'How do I report corruption or misconduct?', answer: 'You can use our anonymous reporting hotline or digital platform. All reports are handled confidentially and with appropriate follow-up.' },
  { question: 'Can my organization partner with DoRight?', answer: 'We welcome partnerships with organizations that share our values. Contact our partnerships team to discuss collaboration opportunities.' },
];

const contactConfig = {
  order: ['ContactHero', 'ContactInfoIntro', 'ContactFormIntro', 'ContactMap', 'ContactFaq'],
  root: {
    fields: {
      seoTitle: textField('Page title (shown in Google and the browser tab)'),
      seoDescription: textareaField('Page description (shown in Google results)'),
    },
    defaultProps: {
      seoTitle: 'Contact Us',
      seoDescription:
        'Reach the DoRight Awareness Initiative team for program inquiries, partnerships, volunteering, media, or general questions.',
    },
  },
  components: {
    ContactHero: {
      label: 'Hero',
      fields: {
        title: textField('Heading'),
        subtitle: textareaField('Intro text'),
        // No "hidden" toggle: the transparent site header needs the dark hero behind it on "/contact".
      },
      defaultProps: {
        title: 'Get in Touch',
        subtitle:
          "We'd love to hear from you. Whether you have questions about our programs,want to get involved,or need support,we're here to help.",
      },
      render: ContactHero,
    },
    ContactInfoIntro: {
      label: 'Contact information',
      fields: {
        heading: textField(`Heading (${SETTINGS_NOTE})`),
        text: textareaField(`Text (${SETTINGS_NOTE})`),
        emailTitle: textField(`Email card title (${SETTINGS_NOTE})`),
        extraEmail: textField('Second email shown on the email card'),
        phoneTitle: textField(`Phone card title (${SETTINGS_NOTE})`),
        addressTitle: textField(`Address card title (${SETTINGS_NOTE})`),
        organisationName: textField('Organisation name shown above the address'),
        hidden: hiddenField,
      },
      defaultProps: {
        heading: 'Contact Information',
        text: 'Multiple ways to reach us. Choose the method that works best for you.',
        emailTitle: 'Email Us',
        extraEmail: 'volunteer@doright.ng',
        phoneTitle: 'Call Us',
        addressTitle: 'Visit Us',
        organisationName: 'DoRight Awareness Initiative',
        hidden: false,
      },
      render: ContactInfoIntro,
    },
    ContactFormIntro: {
      label: 'Contact form and departments',
      fields: {
        formHeading: textField('Form heading'),
        formText: textareaField('Form intro text'),
        successHeading: textField('Heading after the message is sent'),
        successText: textareaField('Text after the message is sent'),
        departmentsHeading: textField('Departments heading'),
        departmentsText: textareaField('Departments intro text'),
        departments: {
          type: 'array',
          label: 'Departments (add, remove or reorder)',
          getItemSummary: (item) => item.name || 'Department',
          defaultItemProps: { name: 'New department', email: '', description: '' },
          arrayFields: {
            name: textField('Name'),
            email: textField('Email'),
            description: textareaField('Description'),
          },
        },
        followHeading: textField(`Social links heading (${SETTINGS_NOTE})`),
        hidden: hiddenField,
      },
      defaultProps: {
        formHeading: 'Send Us a Message',
        formText: 'Have a question, partnership proposal, or suggestion? Send us a message and our team will get back to you promptly.',
        successHeading: 'Message Sent Successfully!',
        successText: 'Thank you for reaching out to DoRight. Our team has received your message and will respond to your email shortly.',
        departmentsHeading: 'Department Contacts',
        departmentsText: 'For specific inquiries,you can reach out directly to the relevant department.',
        departments: DEPARTMENTS,
        followHeading: 'Follow Us',
        hidden: false,
      },
      render: ContactFormIntro,
    },
    ContactMap: {
      label: 'Map',
      fields: {
        heading: textField('Heading'),
        fallbackAddress: textField(`Address text (${SETTINGS_NOTE}; this shows only if none is set)`),
        embedUrl: textField('Map embed link'),
        directionsLabel: textField('Directions link text'),
        directionsUrl: textField('Directions link'),
        hidden: hiddenField,
      },
      defaultProps: {
        heading: 'Find Us',
        fallbackAddress: '28b, Olaminuyun street, Parkview, Lagos, Nigeria 101233',
        embedUrl: 'https://maps.google.com/maps?q=Parkview+Estate,+Ikoyi,+Lagos,+Nigeria&t=&z=15&ie=UTF8&iwloc=&output=embed',
        directionsLabel: 'Open in Google Maps / Get Directions',
        directionsUrl: 'https://www.google.com/maps/search/?api=1&query=Parkview+Estate+Ikoyi+Lagos+Nigeria',
        hidden: false,
      },
      render: ContactMap,
    },
    ContactFaq: {
      label: 'FAQ',
      fields: {
        heading: textField('Heading'),
        text: textareaField('Text'),
        faqs: {
          type: 'array',
          label: 'Questions (add, remove or reorder)',
          getItemSummary: (item) => item.question || 'Question',
          defaultItemProps: { question: 'New question', answer: '' },
          arrayFields: {
            question: textField('Question'),
            answer: textareaField('Answer'),
          },
        },
        hidden: hiddenField,
      },
      defaultProps: {
        heading: 'Frequently Asked Questions',
        text: 'Quick answers to common questions about our organization and programs.',
        faqs: FAQS,
        hidden: false,
      },
      render: ContactFaq,
    },
  },
};

export default contactConfig;
