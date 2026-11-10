// Default Settings Data for Manager
// Mock only. Replace with real API in production.

export const defaultSettings = {
  // 5.1 Security
  security: {
    twoStepEnabled: false,
    twoStepPhone: '+91 98765 43210',
    backupCodes: [
      '9812-4012',
      '7734-1920',
      '3410-8821',
      '6620-1193',
      '8841-3301',
      '5529-7104',
      '2391-4402',
      '1940-5521',
    ],
    loginHistory: [
      { id: 'log-1', timestamp: '6 Nov 2026, 09:15 IST', device: 'Chrome 130 · Windows 11', ip: '103.212.***.42', location: 'Hyderabad, IN', status: 'Success' },
      { id: 'log-2', timestamp: '5 Nov 2026, 18:40 IST', device: 'Safari 17 · iPhone 15', ip: '103.212.***.42', location: 'Hyderabad, IN', status: 'Success' },
      { id: 'log-3', timestamp: '5 Nov 2026, 09:10 IST', device: 'Chrome 130 · Windows 11', ip: '103.212.***.42', location: 'Hyderabad, IN', status: 'Success' },
      { id: 'log-4', timestamp: '4 Nov 2026, 21:05 IST', device: 'Firefox 132 · Linux', ip: '49.204.***.89', location: 'Bengaluru, IN', status: 'Failed' },
      { id: 'log-5', timestamp: '4 Nov 2026, 09:22 IST', device: 'Chrome 130 · Windows 11', ip: '103.212.***.42', location: 'Hyderabad, IN', status: 'Success' },
      { id: 'log-6', timestamp: '3 Nov 2026, 10:04 IST', device: 'Chrome 130 · Windows 11', ip: '103.212.***.42', location: 'Hyderabad, IN', status: 'Success' },
      { id: 'log-7', timestamp: '2 Nov 2026, 09:00 IST', device: 'Chrome 130 · Windows 11', ip: '103.212.***.42', location: 'Hyderabad, IN', status: 'Success' },
      { id: 'log-8', timestamp: '31 Oct 2026, 17:30 IST', device: 'Safari 17 · iPhone 15', ip: '103.212.***.42', location: 'Hyderabad, IN', status: 'Success' },
      { id: 'log-9', timestamp: '31 Oct 2026, 09:12 IST', device: 'Chrome 130 · Windows 11', ip: '103.212.***.42', location: 'Hyderabad, IN', status: 'Success' },
      { id: 'log-10', timestamp: '30 Oct 2026, 09:30 IST', device: 'Chrome 130 · Windows 11', ip: '103.212.***.42', location: 'Hyderabad, IN', status: 'Success' },
    ],
  },

  // 5.2 Notifications
  notifications: {
    preferenceMatrix: {
      Approvals: { inApp: true, email: true, sms: true, lockedInApp: true },
      'Attendance alerts': { inApp: true, email: false, sms: false, lockedInApp: false },
      Leave: { inApp: true, email: true, sms: false, lockedInApp: false },
      'Performance and reviews': { inApp: true, email: true, sms: false, lockedInApp: false },
      Tasks: { inApp: true, email: false, sms: false, lockedInApp: false },
      Meetings: { inApp: true, email: true, sms: false, lockedInApp: false },
      Announcements: { inApp: true, email: true, sms: false, lockedInApp: false },
      'Payroll cycle': { inApp: true, email: true, sms: true, lockedInApp: false },
      System: { inApp: true, email: false, sms: false, lockedInApp: false },
    },
    emailDigest: 'Daily at 9:00 AM', // Instant, Daily at 9:00 AM, Weekly on Monday
    quietHoursEnabled: true,
    quietHoursFrom: '20:00',
    quietHoursTo: '08:00',
    allowUrgentApprovals: true,
    remindApprovalsEvery: 'Daily', // 4 hours, Daily, Off
  },

  // 5.3 Preferences
  preferences: {
    language: 'English',
    timeZone: 'IST (UTC+5:30)',
    dateFormat: '6 Nov 2026', // '6 Nov 2026' | '06/11/2026' | '2026-11-06'
    numberFormat: 'Indian lakh/crore', // 'Indian lakh/crore' | 'International'
    weekStartsOn: 'Monday', // 'Monday' | 'Sunday'
    defaultLandingPage: 'Overview', // 'Overview' | 'Leave Requests' | 'Attendance' | 'Performance'
    displayDensity: 'Comfortable', // 'Comfortable' | 'Compact'
    reduceMotion: false,
  },

  // 5.4 Approvals & Delegation
  delegation: {
    active: false,
    delegatePersonId: 'EMP-005',
    delegatePersonName: 'Rohan Gupta',
    fromDate: '10 Nov 2026',
    toDate: '14 Nov 2026',
    scopes: ['Leave', 'Regularisation'], // Leave, Regularisation, Overtime, Expenses
    escalateAfter: '2 days', // 2 days, 3 days, Off
    escalateTo: 'Director (Rahul Menon)',
    outOfOfficeEnabled: false,
    outOfOfficeFrom: '10 Nov 2026',
    outOfOfficeTo: '14 Nov 2026',
    outOfOfficeMessage: 'I am currently out of office for technical conference travel. Approvals have been delegated to Rohan Gupta. Urgent matters please contact Rahul Menon.',
    quickReplies: [
      'Approved, enjoy your break!',
      'Approved as per sprint commitments.',
      'Approved. Please ensure peer handover notes are updated.',
      'Regularisation approved. Biometric record synced.',
      'Reviewed and confirmed.',
    ],
  },

  // 5.5 Integrations
  integrations: {
    googleCalendar: true,
    outlookCalendar: false,
    microsoftTeams: true,
    slack: true,
    autoAddMeetings: true,
  },

  // 5.6 Privacy & Data
  privacy: {
    showMobileNumber: false,
    showPersonalEmail: false,
    showBirthdayCalendar: true,
    showWorkAnniversary: true,
    exportsHistory: [
      { id: 'EXP-101', date: '15 Oct 2026', type: 'Full Manager Archive (JSON)', status: 'Completed', size: '1.8 MB' },
      { id: 'EXP-102', date: '1 Aug 2026', type: 'Team Attendance Audit (CSV)', status: 'Completed', size: '420 KB' },
    ],
  },
};

