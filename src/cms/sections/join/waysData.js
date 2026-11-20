import { FiUsers, FiHeart } from 'react-icons/fi';
import { FaHandshake } from 'react-icons/fa6';

// Code-owned data for the "ways to get involved" list. interestKey drives the signup form's
// interest options, so it (and icon/colour) never comes from stored content.
// Kept in its own module so the config and the sections can both import it without a cycle.
export const JOIN_WAYS = [
  {
    title: 'Volunteer',
    interestKey: 'Volunteering',
    description: 'Join our community of dedicated volunteers working on the ground to promote integrity and accountability.',
    features: [
      'Community outreach programs',
      'Event organization support',
      'Training and mentorship',
      'Flexible time commitment',
      'Skills development opportunities',
    ],
    icon: FiUsers,
    color: 'bg-primary',
    ctaText: 'Become a Volunteer',
  },
  {
    title: 'Donate',
    interestKey: 'Donating',
    description: 'Support our mission with financial contributions that help us expand our reach and impact across Nigeria.',
    features: [
      'Monthly or one-time donations',
      'Transparent fund allocation',
      'Regular impact reports',
      'Tax-deductible receipts',
      'Direct community impact',
    ],
    icon: FiHeart,
    color: 'bg-accent',
    ctaText: 'Make a Donation',
  },
  {
    title: 'Partner',
    interestKey: 'Partnership',
    description: 'Collaborate with us as an organization, institution, or business to amplify our collective impact.',
    features: [
      'Strategic partnerships',
      'Joint program development',
      'Resource sharing',
      'Co-branded initiatives',
      'Network expansion',
    ],
    icon: FaHandshake,
    color: 'bg-primary',
    ctaText: 'Partner With Us',
  },
];

export const WAYS_ID = 'join-ways';
