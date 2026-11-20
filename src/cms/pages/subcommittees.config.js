import SubCommitteesHero from '../sections/subcommittees/SubCommitteesHero';
import SubCommitteesList from '../sections/subcommittees/SubCommitteesList';
import SubCommitteesFooter from '../sections/subcommittees/SubCommitteesFooter';
import { SUB_COMMITTEES_DATA } from '../../pages/subCommitteesData';
import { fixedListField } from '../fields/fixedList';
import { textField, textareaField, hiddenField } from '../fields/common';

// Defaults are today's copy; ids, numbers, icons, colours and WhatsApp links stay in code.
const COMMITTEE_COPY = SUB_COMMITTEES_DATA.map(({ id, name, shortName, description, responsibilities }) => ({
  id,
  name,
  shortName,
  description,
  responsibilities,
}));

const subCommitteesConfig = {
  order: ['SubCommitteesHero', 'SubCommitteesList', 'SubCommitteesFooter'],
  root: {
    fields: {
      seoTitle: textField('Page title (shown in Google and the browser tab)'),
      seoDescription: textareaField('Page description (shown in Google results)'),
    },
    defaultProps: {
      seoTitle: 'Sub-Committee Roles & Responsibilities',
      seoDescription:
        'Explore the six specialized operational sub-committees of the Doing Right Awareness Initiative (DRAI) driving execution, governance, financial sustainability, and national public impact.',
    },
  },
  components: {
    SubCommitteesHero: {
      label: 'Hero',
      fields: {
        badge: textField('Badge text'),
        title: textField('Heading'),
        greetingHeading: textField('Greeting heading'),
        paragraphs: {
          type: 'array',
          label: 'Greeting paragraphs (basic HTML such as <strong> is allowed)',
          getItemSummary: (item) => (item.text || 'Paragraph').slice(0, 40),
          defaultItemProps: { text: '' },
          arrayFields: { text: textareaField('Paragraph') },
        },
        // No "hidden" toggle: the transparent site header needs the dark hero behind it on "/sub-committees".
      },
      defaultProps: {
        badge: 'Operational Leadership • Specialized Groups',
        title: 'Sub-Committee Roles and Responsibilities',
        greetingHeading: 'Dear Tier 3 Advocate,',
        paragraphs: [
          {
            text: 'As you step into a strategic leadership position, you also take on the role of an operational leader and are required to join one sub-committee.',
          },
          {
            text: 'These groups turn our mission into action and we have <strong class="text-amber-400">six specialized teams</strong> that drive execution, governance, financial sustainability, and public impact.',
          },
          { text: 'Please review the roles of each sub-committee below and select the one you want to join.' },
        ],
      },
      render: SubCommitteesHero,
    },
    SubCommitteesList: {
      label: 'Sub-committees (edit only: no add, remove or reorder)',
      fields: {
        committees: fixedListField({
          label: 'Sub-committees (text only; links, colours and order are fixed)',
          count: SUB_COMMITTEES_DATA.length,
          key: 'id',
          itemLabel: 'name',
          arrayFields: {
            name: textField('Name'),
            shortName: textField('Short name (used on the select link)'),
            description: textareaField('Description'),
            responsibilities: {
              type: 'array',
              label: 'Responsibilities',
              getItemSummary: (item) => item.title || 'Responsibility',
              defaultItemProps: { title: 'New responsibility', desc: '' },
              arrayFields: { title: textField('Title'), desc: textareaField('Description') },
            },
          },
        }),
        rolesHeading: textField('Responsibilities heading'),
        requirementText: textField('Requirement note under each committee'),
        joinLabel: textField('Join button text'),
        selectPrefix: textField('Select link prefix'),
        hidden: hiddenField,
      },
      defaultProps: {
        committees: COMMITTEE_COPY,
        rolesHeading: 'Key Roles & Operational Responsibilities:',
        requirementText: 'Requirement: 70% active meeting involvement & assigned monthly task delivery.',
        joinLabel: 'Join This Sub-Committee',
        selectPrefix: 'Select',
        hidden: false,
      },
      render: SubCommitteesList,
    },
    SubCommitteesFooter: {
      label: 'Closing note (contact details come from Admin → Settings)',
      fields: {
        heading: textField('Heading'),
        textBeforeAdmin: textareaField('Text before the admin phone number (Contact details come from Admin → Settings)'),
        textBeforeDirector: textField('Text before the Managing Director phone number (Contact details come from Admin → Settings)'),
        hidden: hiddenField,
      },
      defaultProps: {
        heading: 'Thank you for selecting a sub-committee and helping us to sustain and grow our movement',
        textBeforeAdmin: 'If you have any questions or need guidance on selecting your committee, contact our admin team on',
        textBeforeDirector: 'or reach our Managing Director on',
        hidden: false,
      },
      render: SubCommitteesFooter,
    },
  },
};

export default subCommitteesConfig;
