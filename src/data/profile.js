// Default Profile Data for Manager
// Mock only. Replace with real API in production.
// Today: Friday, 6 Nov 2026

export const defaultProfile = {
  // Basic Identity
  name: 'Lokesh Kumar',
  preferredName: 'Lokesh',
  avatar: 'LK',
  photoUrl: null,
  employeeId: 'EMP-1042',
  designation: 'Engineering Manager',
  department: 'Engineering',
  businessUnit: 'Core Platform & Apps',
  workLocation: 'Hyderabad',
  reportingTo: {
    name: 'Rahul Menon',
    role: 'Director, Engineering',
    avatar: 'RM',
  },
  joinedDate: '12 Jun 2019',
  tenure: '7 yrs 5 mo',
  employmentType: 'Full-time',
  workEmail: 'lokesh.kumar@company.in',
  teamSize: 24,
  directReports: 18,
  indirectReports: 6,
  status: 'Active',
  costCenter: 'CC-ENG-402',
  shift: 'General (9:30–18:30)',
  noticePeriod: '90 days',
  probationStatus: 'Confirmed',
  profileCompleteness: 86,
  missingItems: ['Add emergency contact address'],

  // Personal Information
  mobile: '9876543210',
  personalEmail: 'priya.nair.personal@example.com',
  dateOfBirth: '14 Mar 1991',
  gender: 'Female',
  bloodGroup: 'B+',
  maritalStatus: 'Married',
  currentAddress: 'Flat 402, Rain Tree Park, Madhapur, Hitec City',
  city: 'Hyderabad',
  state: 'Telangana',
  pinCode: '500081',
  permanentAddress: 'Flat 402, Rain Tree Park, Madhapur, Hitec City',
  sameAddress: true,

  // Emergency Contacts (max 2)
  emergencyContacts: [
    {
      id: 1,
      name: 'Arjun Nair',
      relationship: 'Spouse',
      mobile: '9123456789',
      altMobile: '9445566778',
    },
  ],

  // Skills & Languages
  skills: [
    'React 18',
    'TypeScript',
    'System Design',
    'Team Leadership',
    'GraphQL',
    'Micro-frontends',
    'Agile / Scrum',
    'CI/CD Pipelines',
  ],
  languages: [
    'English (Fluent)',
    'Hindi (Fluent)',
    'Telugu (Conversational)',
    'Malayalam (Native)',
  ],

  // Certifications
  certifications: [
    {
      id: 'CERT-01',
      name: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services',
      issuedDate: '10 Jan 2024',
      expiryDate: '10 Jan 2027',
      status: 'Verified',
      attachment: 'aws_solutions_architect.pdf',
    },
    {
      id: 'CERT-02',
      name: 'Google Cloud Professional Cloud Architect',
      issuer: 'Google Cloud',
      issuedDate: '20 Nov 2023',
      expiryDate: '20 Nov 2026', // Expiring in 14 days!
      status: 'Verified',
      attachment: 'gcp_architect_cert.pdf',
    },
    {
      id: 'CERT-03',
      name: 'Certified ScrumMaster (CSM)',
      issuer: 'Scrum Alliance',
      issuedDate: '15 Mar 2023',
      expiryDate: '15 Mar 2025', // Expired
      status: 'Expired',
      attachment: 'scrum_master_csm.pdf',
    },
  ],

  // HR Change Requests
  changeRequests: [
    {
      id: 'CR-101',
      field: 'Work location',
      currentValue: 'Bengaluru',
      requestedValue: 'Hyderabad',
      reason: 'Relocation to Hyderabad Engineering Centre',
      status: 'Approved',
      date: '15 Sep 2026',
    },
  ],

  // Activity Timeline
  activity: [
    {
      id: 'act-1',
      type: 'Profile',
      text: 'Updated mobile phone number to +91 98765 43210',
      timestamp: 'Today, 2:15 PM',
    },
    {
      id: 'act-2',
      type: 'Security',
      text: 'Password changed successfully',
      timestamp: 'Yesterday, 6:30 PM',
    },
    {
      id: 'act-3',
      type: 'Approvals',
      text: 'Approved Casual Leave request for Sneha Reddy',
      timestamp: 'Yesterday, 11:20 AM',
    },
    {
      id: 'act-4',
      type: 'Security',
      text: 'Login from Chrome 130 on Windows 11 (Hyderabad, IN)',
      timestamp: '4 Nov 2026, 9:15 AM',
    },
    {
      id: 'act-5',
      type: 'Profile',
      text: 'Added AWS Solutions Architect certification renewal dossier',
      timestamp: '1 Nov 2026, 4:00 PM',
    },
  ],
};

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi NCR',
];

