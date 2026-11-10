// Configurable attendance rules for Manager Desk
// Configurable example, to be validated by HR
// Never hardcode a rule number in a component; reference attendanceRules.

export const attendanceRules = {
  // Shift definition
  shift: {
    name: 'General',
    startTime: '09:30', // 9:30 AM
    endTime: '18:30',   // 6:30 PM
    spanHours: 9,
    spanMs: 9 * 60 * 60 * 1000,
  },

  // Grace and arrival policies
  gracePeriodMin: 15, // Up to 09:45 is on time
  lateCutoffTime: '09:45',
  freeLateMarksPerMonth: 3,

  // Break policy
  mandatoryBreakMin: 60, // Auto-deducted if person records no breaks
  allowedBreakTotalMin: 75,
  minBreakRecordMin: 5, // Breaks < 5 min are merged into working time

  // Day thresholds (net working hours)
  fullDayMinHours: 8,
  fullDayMinMs: 8 * 60 * 60 * 1000,
  shortHoursMinHours: 4.5, // 4h 30m
  shortHoursMinMs: 4.5 * 60 * 60 * 1000,

  // Departure policy
  earlyDepartureGraceMin: 15,
  earlyDepartureCutoffTime: '18:15', // 6:30 PM minus 15 min

  // Overtime threshold (net hours)
  overtimeThresholdHours: 9,
  overtimeThresholdMs: 9 * 60 * 60 * 1000,

  // Compliance and regularization
  autoCheckoutTime: '23:59',
  regularisationWindowDays: 3,
  maxRegularisationsPerMonth: 3,
  approverName: 'Rahul Menon (Director, Engineering)',

  // Work modes and Geo fencing
  allowedWorkModes: ['Office', 'Work from home', 'Remote/Travel'],
  officeGeoRadiusMeters: 200,
  officeCoordinates: {
    lat: 17.4483, // Hyderabad office coordinates sample
    lng: 78.3742,
  },

  // Weekly off
  weeklyOffDays: [0, 6], // Sunday = 0, Saturday = 6
};

