export const mockUsers = [
  { id: 1, name: 'Admin User', email: 'admin@doright.ng', role: 'admin', status: 'Active', joined: '2023-01-15' },
  { id: 2, name: 'Dr. Amina Hassan', email: 'instructor@doright.ng', role: 'instructor', status: 'Active', joined: '2023-02-01' },
  { id: 3, name: 'John Doe', email: 'student@doright.ng', role: 'student', status: 'Active', joined: '2023-03-10' },
  { id: 4, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'student', status: 'Active', joined: '2023-04-20' },
  { id: 5, name: 'David Lee', email: 'david.lee@example.com', role: 'student', status: 'Inactive', joined: '2023-05-05' },
  { id: 6, name: 'Sarah Chen', email: 'sarah.chen@example.com', role: 'instructor', status: 'Active', joined: '2023-06-12' },
  { id: 7, name: 'Michael Brown', email: 'michael.brown@example.com', role: 'student', status: 'Active', joined: '2023-07-21' },
  { id: 8, name: 'Emily White', email: 'emily.white@example.com', role: 'staff', status: 'Active', joined: '2023-08-01' },
];

export const mockCourses = [
  { id: 'C1', title: 'Foundations of Integrity', instructor: 'Dr. Amina Hassan', status: 'Published', enrolled: 1520, created: '2023-01-20' },
  { id: 'C2', title: 'Leadership & Civic Responsibility', instructor: 'Dr. Amina Hassan', status: 'Published', enrolled: 1250, created: '2023-02-15' },
  { id: 'C3', title: 'Anti-Corruption & Reporting', instructor: 'Sarah Chen', status: 'Published', enrolled: 980, created: '2023-03-10' },
  { id: 'C4', title: 'Advocacy & Campaign Design', instructor: 'Sarah Chen', status: 'Draft', enrolled: 0, created: '2023-08-01' },
  { id: 'C5', title: 'Sustainable Community Action', instructor: 'Dr. Amina Hassan', status: 'Archived', enrolled: 750, created: '2023-04-05' },
];

export const mockStats = {
  totalUsers: 1850,
  activeCourses: 3,
  completedEnrollments: 2890,
  siteRevenue: 0, // Since courses are free
};

export const mockRecentActivity = [
  { id: 1, user: 'Jane Smith', action: 'enrolled in "Foundations of Integrity"', time: '2 hours ago' },
  { id: 2, user: 'Admin User', action: 'updated site settings', time: '5 hours ago' },
  { id: 3, user: 'Dr. Amina Hassan', action: 'published a new announcement for "Leadership & Civic Responsibility"', time: '1 day ago' },
  { id: 4, user: 'Michael Brown', action: 'completed "Foundations of Integrity"', time: '2 days ago' },
];