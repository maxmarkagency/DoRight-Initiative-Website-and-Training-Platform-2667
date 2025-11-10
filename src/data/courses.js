export const courses = [
  {
    id: 'integrity-101',
    title: 'Foundations of Integrity',
    category: 'Integrity & Ethics',
    short_description: 'A comprehensive introduction to the core principles of integrity and ethical conduct.',
    instructor: 'Dr. Amina Hassan',
    duration: '4 weeks',
    level: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1632&q=80',
    long_description: 'This course provides a foundational understanding of integrity, exploring its importance in personal, professional, and civic life. Participants will learn to identify ethical dilemmas, apply decision-making frameworks, and cultivate a personal code of conduct. Through case studies and interactive discussions, this course will equip you with the tools to act with integrity in any situation.'
  },
  {
    id: 'leadership-201',
    title: 'Leadership & Civic Responsibility',
    category: 'Leadership',
    short_description: 'Develop your leadership skills and learn how to drive positive change in your community.',
    instructor: 'Babatunde Adekunle',
    duration: '6 weeks',
    level: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80',
    long_description: 'Explore the connection between effective leadership and active civic engagement. This course covers theories of leadership, strategies for community organizing, and the principles of social responsibility. Participants will design and implement a small-scale community project, gaining hands-on experience in mobilizing others for a common cause.'
  },
  {
    id: 'anticorruption-301',
    title: 'Anti-Corruption Strategies',
    category: 'Anti-Corruption',
    short_description: 'An in-depth look at the causes of corruption and effective strategies to combat it.',
    instructor: 'Ngozi Okonjo-Iweala',
    duration: '8 weeks',
    level: 'Advanced',
    thumbnail: 'https://images.unsplash.com/photo-1589996448606-2e6b835698a7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
    long_description: 'This advanced course provides a rigorous analysis of the systemic causes of corruption and explores evidence-based strategies for promoting transparency and accountability. Topics include institutional reform, the role of civil society, international anti-corruption frameworks, and the use of technology in fighting graft. This course is designed for professionals in public service, law, and non-profit sectors.'
  },
  {
    id: 'youth-dev-101',
    title: 'Youth in Governance',
    category: 'Youth Development',
    short_description: 'Empowering the next generation of leaders to participate in governance and public service.',
    instructor: 'Funke Opeke',
    duration: '5 weeks',
    level: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1573496773905-f5b17e76b254?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
    long_description: 'This course is designed to equip young people with the knowledge and skills to engage in civic life and public service. It covers the structure of government, the importance of youth participation, and practical ways to make a difference. Through workshops and mentorship, participants will develop their own action plans for civic engagement.'
  }
];

export const lessons = {
  'integrity-101': [
    { id: 'l1-1', title: 'What is Integrity?', duration: '15 min', completed: true },
    { id: 'l1-2', title: 'Ethical Decision Making Models', duration: '30 min', completed: true },
    { id: 'l1-3', title: 'Case Study: The Honest Employee', duration: '20 min', completed: false },
    { id: 'l1-4', title: 'Personal Accountability', duration: '25 min', completed: false },
    { id: 'l1-5', title: 'Final Quiz', duration: '10 min', completed: false },
  ],
  'leadership-201': [
    { id: 'l2-1', title: 'Theories of Leadership', duration: '25 min', completed: true },
    { id: 'l2-2', title: 'Understanding Civic Responsibility', duration: '20 min', completed: true },
    { id: 'l2-3', title: 'Community Needs Assessment', duration: '45 min', completed: true },
    { id: 'l2-4', title: 'Project Planning Workshop', duration: '60 min', completed: false },
    { id: 'l2-5', title: 'Final Project Submission', duration: '30 min', completed: false },
  ],
  'anticorruption-301': [
    { id: 'l3-1', title: 'The Anatomy of Corruption', duration: '40 min', completed: false },
    { id: 'l3-2', title: 'Institutional Reforms', duration: '50 min', completed: false },
    { id: 'l3-3', title: 'Technology as a Tool for Transparency', duration: '45 min', completed: false },
    { id: 'l3-4', title: 'International Case Studies', duration: '60 min', completed: false },
  ],
  'youth-dev-101': [
    { id: 'l4-1', title: 'Introduction to Governance', duration: '30 min', completed: true },
    { id: 'l4-2', title: 'The Power of Youth Voice', duration: '25 min', completed: false },
    { id: 'l4-3', title: 'Workshop: Crafting a Policy Proposal', duration: '75 min', completed: false },
    { id: 'l4-4', title: 'Engaging with Public Officials', duration: '40 min', completed: false },
  ],
};