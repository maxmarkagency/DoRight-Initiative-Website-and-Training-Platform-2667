import TrusteesHero from '../sections/trustees/TrusteesHero';
import TrusteesIntro from '../sections/trustees/TrusteesIntro';
import TrusteesList from '../sections/trustees/TrusteesList';
import TrusteesClosing from '../sections/trustees/TrusteesClosing';
import { imageField } from '../fields/imageField';
import { textField, textareaField, buttonField, hiddenField } from '../fields/common';

const TRUSTEES = [
  { name: 'Pastor Wale Adefarasin', photo: { url: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759593162037-wale-adefarasin-1.jpg', alt: 'Pastor Wale Adefarasin' }, description: 'Pastor Wale Adefarasin is the General Overseer of Guiding Light Assembly, he is presenter of \'The Heart of the matter\', a television programme that deals with social issues.', fullProfile: 'He is married to Pastor Olaolu Adefarasin and they have 3 children and 2 grandchildren. He is a firm believer in the sanctity of \'family\', and the importance of family in our national life. He believes that it is in the family that the character of our future leaders is forged. Pastor Wale Adefarasin has great hope in the future of Nigeria, and is passionate that there is a future and a hope for Nigeria, once its citizens arise to work for it.' },
  { name: 'Ayodele Alamutu', photo: { url: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759593178510-alamutu-1.jpg', alt: 'Ayodele Alamutu' }, description: 'She is the founder of RollTheDice Global Resources, involved in Internal Control, Audit, Business Advisory and Risk Management Advisory Services. She is a Risk Management, Assurance and Control Executive with more than 25 years progressive experience in the UK and Nigeria.', fullProfile: 'Ms. Alamutu is a fellow of the Institute of Chartered Accountants of Nigeria, A Certified member of The Institute of Risk Management (CIRM) and currently the Vice Chair of IRM Nigeria Regional Group. She is an Information Systems Auditor, Project Management Professional and a Board member of the Institute of Internal Auditors. She has been mentoring youths for over 30 years and is rewarded by living to witness the strides these youths have and are achieving today. This has geared her to continue her involvement with the youth and join them to help promote the tenets of Doing Right nationally. In her spare time, she loves to read and Zumba dance. Her risk management philosophy is to challenge management to consider extreme events and asymmetric risks that could impact their objectives and test them against their current activities.' },
  { name: 'Ekeinde Ohiwerei', photo: { url: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759593181701-ekehinde-1.jpg', alt: 'Ekeinde Ohiwerei' }, description: 'Ekeinde Ohiwerei has broad technical, commercial and leadership skills acquired in his career at Nigeria LNG Limited. His technical roles have been in maintenance, engineering and projects.', fullProfile: 'He has led key corporate activities and initiatives over the years. These include handling all contracting and procurement activities across and driving Nigerian Content. He currently leads the launched the company\'s digital transformation and energy transition agendas along with responsibilities for projects and engineering. Ekeinde is a member of the Nigerian Society of Engineers and Council for the Regulation of Engineering in Nigeria (COREN), as well as a member of the Chartered Institute of Procurement and Supply.' },
  { name: 'Tunde Oduwole', photo: { url: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759593188790-oduwole-1.jpg', alt: 'Tunde Oduwole' }, description: 'Tunde Oduwole is a passionate believer in Nigeria and the promise the country holds. He is currently the Financial Director at a multinational energy company in Nigeria.', fullProfile: 'He has nearly three decades of rich experience across commercial finance, corporate strategy, business development, audit and accounting across oil and gas industry, financial and management consulting in Africa, Europe and North America. He has served on Boards of multinational energy companies in Nigeria and West Africa and has led multi-billion dollars corporate and project finance transactions that unlocked immense economic opportunities for Nigeria in the upstream and midstream energy sectors. A Fellow of the Institute of Chartered Accountants of Nigeria, as well as an International Associate of the American Institute of Certified Public Accountants. He holds a Master of Science degree in Banking and Finance from Boston University, Massachusetts USA. An adventurous traveller, who enjoys painting, playing saxophone and producing stage plays. Among other plays, in 2017 he produced the critically acclaimed play "Gula" based on a written account of former President Olusegun Obasanjo\'s experience with a young underworld kingpin while a political prisoner.' },
  { name: 'Ajibike Badeji', photo: { url: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759593192104-mrs-badeji-1.jpg', alt: 'Ajibike Badeji' }, description: 'Ajibike Badeji has over 20 years combined experience in business, management and technology consulting. She is an accredited SMEDAN Business Development Service Provider (BDSP), a certified Scrum Master and a certified Learning and Performance Institute (LPI) Trainer.', fullProfile: 'She is passionate about Nigeria, entrepreneurs and the economic development of women and hence loves to coach and mentor entrepreneurs and young women. In addition to being an International Finance Corporation (IFC) Trainer, she brings extensive expertise in business development and technology consulting to help drive positive change in communities across Nigeria.' },
  { name: 'Adeniyi Aromolaran', photo: { url: 'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759593586025-niyi-1.png', alt: 'Adeniyi Aromolaran' }, description: 'Adeniyi Aromolaran, MCIoD,FCIPM,FITD,HRPL,fondly referred to as "AA"- The Transformer\', is a Certified Sustainable Development Solutions & Modelling Consultant, an International Finance Corporation/Learning and Performance Institute (LPI) Certified Trainer.', fullProfile: 'He is an Expert-In-Residence at the Enterprise Development Centre,(EDC), Lagos Business School,(LBS) Pan African University, Lagos Nigeria. At various times he served on the Council of the Nigeria-Britain Association as the Honorary Deputy Financial Secretary, Honorary Financial Secretary, Honorary Treasurer and Honorary Secretary. He was a one-time Global President of Government College Lagos Old Boys Association, GCLOBA). He is presently the Executive Director, Enterprises Services Directorate at the Lagos State Development and Property Corporation, LSDPC. He is the Co-Convener/Co-Founder, Rethinking Nigeria Business Leadership Network. The network promotes the "Rethinking Business Conduct and Practices- a Sustainable Concept to Transforming Nigeria\'s Business Eco-System mind-set.' }
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
        heading: textField('Heading'),
        text: textareaField('Intro text'),
        // No "hidden" toggle: the transparent site header needs the dark hero behind it on "/trustees".
      },
      defaultProps: {
        heading: 'OUR TRUSTEES',
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
          defaultItemProps: { name: 'New trustee', description: '', fullProfile: '', photo: { url: '', alt: '' } },
          arrayFields: {
            name: textField('Name'),
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
