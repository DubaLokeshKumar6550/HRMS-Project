// CSV and Report download utilities for Manager Desk

export function downloadCSV(filename, rows) {
  const processRow = (row) =>
    row.map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',');

  const csvContent = rows.map(processRow).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAttendanceCSV(employees, date = '2026-11-06') {
  const headers = [
    'Employee ID',
    'Name',
    'Role',
    'Department',
    'Location',
    'Status',
    'Punch In',
    'Punch Out',
    'Hours Worked',
    'GPS In Coordinates',
    'GPS In Geofence',
    'GPS Out Coordinates',
    'Reporting',
  ];

  const dataRows = employees.map((emp) => [
    emp.id,
    emp.name,
    emp.role,
    emp.department,
    emp.location,
    emp.status,
    emp.punchIn,
    emp.punchOut,
    emp.hoursWorked,
    emp.punchInGps ? `${emp.punchInGps.lat}, ${emp.punchInGps.lng}` : 'N/A',
    emp.punchInGps?.geofence ? (emp.punchInGps.geofence.isInside ? 'Inside (Compliant)' : `Outside (${emp.punchInGps.geofence.distanceMeters}m)`) : 'N/A',
    emp.punchOutGps ? `${emp.punchOutGps.lat}, ${emp.punchOutGps.lng}` : 'N/A',
    emp.reporting,
  ]);

  downloadCSV(`team-attendance-${date}.csv`, [headers, ...dataRows]);
}

export function exportPayrollInputsCSV(employees, payrollCycle) {
  const headers = [
    'Employee ID',
    'Name',
    'Role',
    'State',
    'Paid Days (of 30)',
    'LOP Unpaid Days',
    'Overtime Hours',
    'Pending Claims',
    'Compliance Flags',
  ];

  const dataRows = employees.map((emp) => [
    emp.id,
    emp.name,
    emp.role,
    emp.state,
    emp.paidDays,
    emp.lopDays,
    emp.overtimeHours,
    emp.reimbursementsPending,
    (emp.flags || []).join('; ') || 'Verified',
  ]);

  downloadCSV(`payroll-inputs-nov2026.csv`, [headers, ...dataRows]);
}

export function exportTeamRosterCSV(employees) {
  const headers = [
    'Employee ID',
    'Name',
    'Role',
    'Department',
    'Location',
    'State',
    'Email',
    'Phone',
    'Join Date',
    'Tenure',
    'Probation Status',
    'Casual Leave',
    'Sick Leave',
    'Earned Leave',
    'Comp Off',
    'Last 1:1 Date',
  ];

  const dataRows = employees.map((emp) => [
    emp.id,
    emp.name,
    emp.role,
    emp.department,
    emp.location,
    emp.state,
    emp.email,
    emp.phone,
    emp.joinDate,
    emp.tenure,
    emp.isProbation ? 'On Probation' : 'Confirmed',
    emp.leaveBalance?.casual || 0,
    emp.leaveBalance?.sick || 0,
    emp.leaveBalance?.earned || 0,
    emp.leaveBalance?.compOff || 0,
    emp.last1on1,
  ]);

  downloadCSV(`team-roster-directory.csv`, [headers, ...dataRows]);
}

