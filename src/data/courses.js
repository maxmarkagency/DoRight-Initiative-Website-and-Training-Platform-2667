export const courses = [
  {
    id: "C1",
    title: "Foundations of Integrity",
    description: "Core values, ethics and personal accountability.",
    prerequisite: null,
    lessons: [
      { id: "C1-L1", title: "What Is Integrity?", video: "C1-L1.mp4", duration: "8:00" },
      { id: "C1-L2", title: "Everyday Ethics", video: "C1-L2.mp4", duration: "12:00" },
      { id: "C1-L3", title: "Taking Action", video: "C1-L3.mp4", duration: "10:00" }
    ],
    assessment: { type: "quiz", pass_percent: 70, questions: 8 },
    certificate: "Foundations Certificate",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "C2",
    title: "Leadership & Civic Responsibility",
    description: "Leading with integrity; community service.",
    prerequisite: "C1",
    lessons: [
      { id: "C2-L1", title: "Principles of Leadership", video: "C2-L1.mp4", duration: "15:00" },
      { id: "C2-L2", title: "Mobilizing Communities", video: "C2-L2.mp4", duration: "12:00" }
    ],
    assessment: { type: "quiz", pass_percent: 70, questions: 10 },
    certificate: "Leadership Certificate",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "C3",
    title: "Anti-Corruption & Reporting",
    description: "Identify corruption and report safely.",
    prerequisite: "C2",
    lessons: [
      { id: "C3-L1", title: "Recognizing Corruption", video: "C3-L1.mp4", duration: "12:00" },
      { id: "C3-L2", title: "Reporting Channels", video: "C3-L2.mp4", duration: "10:00" }
    ],
    assessment: { type: "quiz", pass_percent: 75, questions: 10 },
    certificate: "Anti-Corruption Certificate",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "C4",
    title: "Advocacy & Campaign Design",
    description: "Designing campaigns for impact.",
    prerequisite: "C3",
    lessons: [
      { id: "C4-L1", title: "Campaign Planning", video: "C4-L1.mp4", duration: "18:00" },
      { id: "C4-L2", title: "Measuring Impact", video: "C4-L2.mp4", duration: "14:00" }
    ],
    assessment: { type: "project", instructions: "Submit a one-page campaign plan", pass_percent: 100 },
    certificate: "Advocacy Certificate",
    image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "C5",
    title: "Sustainable Community Action",
    description: "Scaling & sustaining community projects.",
    prerequisite: "C4",
    lessons: [
      { id: "C5-L1", title: "Sustainability Models", video: "C5-L1.mp4", duration: "16:00" },
      { id: "C5-L2", title: "Funding & Partnerships", video: "C5-L2.mp4", duration: "12:00" }
    ],
    assessment: { type: "project", instructions: "Submit a scaling plan", pass_percent: 100 },
    certificate: "Community Action Diploma",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }
];