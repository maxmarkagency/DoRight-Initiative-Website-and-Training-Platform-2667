import TrusteesHero from '../sections/trustees/TrusteesHero';
import TrusteesIntro from '../sections/trustees/TrusteesIntro';
import TrusteesList from '../sections/trustees/TrusteesList';
import TrusteesClosing from '../sections/trustees/TrusteesClosing';
import { imageField } from '../fields/imageField';
import { textField, textareaField, buttonField, hiddenField } from '../fields/common';

const S3 = 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com';

const TRUSTEES = [
  {
    name: 'Pastor Wale Adefarasin',
    role: 'General Overseer & National Reformist',
    photo: { url: `${S3}/1759593162037-wale-adefarasin-1.jpg`, alt: 'Pastor Wale Adefarasin' },
    description: 'Pastor Wale Adefarasin is the General Overseer of Guiding Light Assembly and host of the television broadcast The Heart of the Matter.',
    fullProfile: "A passionate advocate for national transformation, he champions the family unit as the crucible where future leaders' character is forged, holding an unshakeable faith that Nigeria’s bright future rests on active citizenship. He is happily married to Pastor Olaolu Adefarasin, and together they have three children and two grandchildren.",
  },
  {
    name: 'Ayodele Alamutu',
    role: 'Governance & Risk Executive',
    photo: { url: `${S3}/1759593178510-alamutu-1.jpg`, alt: 'Ayodele Alamutu' },
    description: 'Ayodele Alamutu is a Risk Management, Assurance, and Control Executive with over 25 years of global experience across the UK and Nigeria.',
    fullProfile: 'Founder of RollTheDice Global Resources, she holds key credentials as a Fellow of ICAN, Vice Chair of IRM Nigeria, PMP, CISA, and Board Member of the Institute of Internal Auditors. Alongside her strategic governance work, she brings a 30-year legacy of youth mentorship and deep commitment to national values through the Doing Right Awareness Initiative.',
  },
  {
    name: 'Ekeinde Ohiwerei',
    role: 'Technical & Enterprise Leader',
    photo: { url: `${S3}/1759593181701-ekehinde-1.jpg`, alt: 'Ekeinde Ohiwerei' },
    description: 'Ekeinde Ohiwerei is a seasoned engineering and corporate leader with an extensive career at Nigeria LNG Limited.',
    fullProfile: "Combining deep technical mastery with commercial acumen and stakeholder management, he has led critical enterprise initiatives spanning procurement, local content development, projects, and engineering - while spearheading the company's digital transformation and energy transition agendas. He is a registered member of the Nigerian Society of Engineers (NSE), COREN, IMechE, Chartered Institute of Directors (CIOD) and the Chartered Institute of Procurement and Supply (CIPS).",
  },
  {
    name: 'Tunde Oduwole',
    role: 'Financial Director & Corporate Strategist',
    photo: { url: `${S3}/1759593188790-oduwole-1.jpg`, alt: 'Tunde Oduwole' },
    description: 'Tunde Oduwole is a financial director, corporate strategist, and advocate for Nigeria’s economic development with nearly 30 years of global experience in finance, energy, and governance across Africa, Europe, and North America.',
    fullProfile: 'A former board member of West African energy firms, he has led multi-billion-dollar financing transactions that drove national growth. He is a Fellow of ICAN, an International Associate of the AICPA, a Boston University M.Sc. graduate, and an accomplished painter, saxophonist, and stage producer of the acclaimed play Gula.',
  },
  {
    name: 'Ajibike Badeji',
    role: 'Business, Management and Technology Consultant',
    photo: { url: `${S3}/1759593192104-mrs-badeji-1.jpg`, alt: 'Ajibike Badeji' },
    description: 'Ajibike Badeji is a business, management, and technology consultant with over 20 years of experience delivering technology-enabled transformation, strategic change and business improvement across diverse industries.',
    fullProfile: 'She combines deep operational expertise with a passion for coaching entrepreneurs and empowering women to drive positive change and community transformation across Nigeria.',
  },
  {
    name: 'Adeniyi Nehemiah Aromolaran (MCIoD, FCIPM, FITD, FNIM, HRPL)',
    role: 'Executive Director, Enterprise Services Directorate',
    photo: { url: `${S3}/1759593586025-niyi-1.png`, alt: 'Adeniyi Nehemiah Aromolaran' },
    description: 'Adeniyi Aromolaran - widely known as "AA - The Transformer" - is the Executive Director of Enterprise Services Directorate at the Lagos State Development and Property Corporation (LSDPC).',
    fullProfile: 'A Sustainable Development Expert, an IFC/LPI Certified Trainer, Organisation, Human Capital and Learning Development Specialist, President, National Institute for Policy & Strategy Studies PSLC Cohort 51, author and publisher of "Leading with Impact - Keys to Avoiding Collateral Damage", a past Honorary Council member of the Nigeria-Britain Association and past Global President of Government College Lagos Old Boys Association (GCLOBA). He co-founded the Rethinking Nigeria Business Leadership Network to champion sustainable corporate governance and conduct. He is also the Founder/Visioner, Nehemiah Aromolaran Foundation, enablers of "Lend a Hand", a Social Enterprise Initiative.',
  },
  {
    name: 'Adesua Adewole',
    role: 'General Manager, Country Services, TotalEnergies Nigeria',
    photo: { url: '/trustees/adesua-adewole.jpg', alt: 'Adesua Adewole' },
    description: 'Adesua Adewole is General Manager, Country Services at TotalEnergies in Nigeria, where she leads corporate communications, reputation management and stakeholder engagement, and provides CSR oversight for the downstream business.',
    fullProfile: 'Over 29 years with TotalEnergies across Nigeria, Ghana and South Africa, she has worked in sales and marketing, human resources and corporate affairs, bringing a broad, business-wide perspective to her leadership. Adesua holds an MBA from the University of Leeds and a B.Sc. in Geography and Regional Planning from the University of Benin. She is an ICF-certified coach and mentors managers and emerging women leaders.',
  },
];

const trusteesConfig = {
  order: ['TrusteesHero', 'TrusteesIntro', 'TrusteesList', 'TrusteesClosing'],
  root: {
    fields: {
      seoTitle: textField('Page title (shown in Google and the browser tab)'),
      seoDescription: textareaField('Page description (shown in Google results)'),
    },
    defaultProps: {
      seoTitle: 'Our Board of Trustees',
      seoDescription:
        "Meet the Board of Trustees guiding DoRight Awareness Initiative's mission to promote integrity and civic responsibility across Nigeria.",
    },
  },
  components: {
    TrusteesHero: {
      label: 'Hero',
      fields: {
        eyebrow: textField('Small label above the heading'),
        heading: textField('Heading'),
        text: textareaField('Intro text'),
        // No "hidden" toggle: the transparent site header needs the dark hero behind it on "/trustees".
      },
      defaultProps: {
        eyebrow: 'WHO WE ARE',
        heading: 'OUR BOARD OF TRUSTEES',
        text: "Meet the distinguished leaders who guide DRAI's mission with their wisdom, expertise, and unwavering commitment to building a Nigeria of integrity and accountability.",
      },
      render: TrusteesHero,
    },
    TrusteesIntro: {
      label: 'Introduction',
      fields: {
        heading: textField('Heading'),
        text: textareaField('Text'),
        hidden: hiddenField,
      },
      defaultProps: {
        heading: 'Leadership with Purpose',
        text: 'Our Board of Trustees brings together exceptional individuals from diverse backgrounds - spiritual leadership, finance, engineering, business consulting, and sustainable development. Each trustee shares our vision of a Nigeria where integrity thrives and contributes their unique expertise to guide our strategic direction and ensure our impact reaches every corner of the nation.',
        hidden: false,
      },
      render: TrusteesIntro,
    },
    TrusteesList: {
      label: 'Trustees',
      fields: {
        trustees: {
          type: 'array',
          label: 'Trustees (add, remove or reorder)',
          getItemSummary: (item) => item.name || 'Trustee',
          defaultItemProps: { name: 'New trustee', role: '', description: '', fullProfile: '', photo: { url: '', alt: '' } },
          arrayFields: {
            name: textField('Name'),
            role: textField('Title / role (shown under the name)'),
            photo: imageField('Photo'),
            description: textareaField('Short bio'),
            fullProfile: textareaField('Full profile'),
          },
        },
        hidden: hiddenField,
      },
      defaultProps: { trustees: TRUSTEES, hidden: false },
      render: TrusteesList,
    },
    TrusteesClosing: {
      label: 'Closing call to action',
      fields: {
        heading: textField('Heading'),
        text: textareaField('Text'),
        primaryButton: buttonField('Main button'),
        secondaryButton: buttonField('Second button'),
        hidden: hiddenField,
      },
      defaultProps: {
        heading: 'Guided by Excellence',
        text: 'Under the guidance of these distinguished trustees, DRAI continues to expand its impact across Nigeria, building communities of integrity and accountability that will transform our nation.',
        primaryButton: { label: 'Learn More About DRAI', href: '/about' },
        secondaryButton: { label: 'Join Our Mission', href: '/join' },
        hidden: false,
      },
      render: TrusteesClosing,
    },
  },
};

export default trusteesConfig;
