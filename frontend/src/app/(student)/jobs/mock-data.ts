export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  ctc: string;
  requiredCgpa: number;
  allowedBranches: string[];
  backlogAllowed: boolean;
  status: 'ACTIVE' | 'DEACTIVE';
  deadline: string;
  createdAt: string;
  eligible: boolean;
  ineligibilityReason?: string;
}

export const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'Software Engineer Intern',
    company: 'Google',
    location: 'Bangalore',
    description: 'Work on large scale distributed systems.',
    ctc: '12 LPA',
    requiredCgpa: 8.0,
    allowedBranches: ['CSE', 'IT'],
    backlogAllowed: false,
    status: 'ACTIVE',
    deadline: '2026-04-30T00:00:00Z',
    createdAt: '2026-04-01T00:00:00Z',
    eligible: true,
  },
  {
    id: '2',
    title: 'Systems Engineer',
    company: 'Infosys',
    location: 'Remote',
    description: 'Develop and maintain enterprise applications.',
    ctc: '6.5 LPA',
    requiredCgpa: 6.5,
    allowedBranches: ['All branches'],
    backlogAllowed: true,
    status: 'ACTIVE',
    deadline: '2026-05-05T00:00:00Z',
    createdAt: '2026-04-10T00:00:00Z',
    eligible: true,
  },
  {
    id: '3',
    title: 'Product Analyst',
    company: 'Wipro',
    location: 'Hyderabad',
    description: 'Analyze product metrics and drive growth.',
    ctc: '7 LPA',
    requiredCgpa: 7.0,
    allowedBranches: ['CSE', 'ECE'],
    backlogAllowed: true,
    status: 'ACTIVE',
    deadline: '2026-05-12T00:00:00Z',
    createdAt: '2026-04-15T00:00:00Z',
    eligible: true,
  },
  {
    id: '4',
    title: 'Data Analyst',
    company: 'TCS',
    location: 'Hyderabad',
    description: 'Work with data to provide business insights.',
    ctc: '8 LPA',
    requiredCgpa: 9.0,
    allowedBranches: ['CSE', 'MCA'],
    backlogAllowed: false,
    status: 'ACTIVE',
    deadline: '2026-05-18T00:00:00Z',
    createdAt: '2026-04-20T00:00:00Z',
    eligible: false,
    ineligibilityReason: 'CGPA too low',
  },
  {
    id: '5',
    title: 'Frontend Developer',
    company: 'Zomato',
    location: 'Gurgaon',
    description: 'Build beautiful user interfaces.',
    ctc: '15 LPA',
    requiredCgpa: 8.5,
    allowedBranches: ['CSE', 'IT'],
    backlogAllowed: false,
    status: 'ACTIVE',
    deadline: '2026-05-20T00:00:00Z',
    createdAt: '2026-04-22T00:00:00Z',
    eligible: true,
  },
  {
    id: '6',
    title: 'Cloud Engineer',
    company: 'Amazon',
    location: 'Bangalore',
    description: 'Manage cloud infrastructure.',
    ctc: '18 LPA',
    requiredCgpa: 8.0,
    allowedBranches: ['CSE', 'IT', 'ECE'],
    backlogAllowed: false,
    status: 'ACTIVE',
    deadline: '2026-05-25T00:00:00Z',
    createdAt: '2026-04-25T00:00:00Z',
    eligible: false,
    ineligibilityReason: 'Backlogs not allowed',
  },
];
