// Teams and Pods configuration for HRMS Manager Dashboard
// Engineering Manager: Lokesh Kumar (24-person team across 6 functional pods)

export const teamsData = [
  {
    id: 'team-frontend',
    name: 'Frontend Engineering',
    shortName: 'Frontend',
    icon: 'Layout',
    department: 'Engineering',
    location: 'Bengaluru HQ',
    leadId: 'EMP-114',
    leadName: 'Farhan Akhtar',
    leadRole: 'Senior Frontend Engineer',
    description: 'Core web UI architecture, Monsoon Glass design system, React 18 modernization, and web performance optimization.',
    activeProjects: [
      'Monsoon Glass Design System v2',
      'Core Web Vitals Optimization (LCP < 1.8s)',
      'Design Token Accessibility (WCAG AAA)',
    ],
    memberIds: ['EMP-114', 'EMP-108', 'EMP-122', 'EMP-107', 'EMP-118'],
  },
  {
    id: 'team-backend',
    name: 'Backend & Systems',
    shortName: 'Backend',
    icon: 'Server',
    department: 'Engineering',
    location: 'Bengaluru & Hyderabad',
    leadId: 'EMP-117',
    leadName: 'Nikhil Verma',
    leadRole: 'System Architect',
    description: 'High-throughput microservices, payroll rules engine, biometric sync pipelines, and database optimization.',
    activeProjects: [
      'Biometric Multi-Clock Device Gateway',
      'Payroll Calculation Engine v3',
      'PostgreSQL Query Latency Optimization',
    ],
    memberIds: ['EMP-117', 'EMP-104', 'EMP-111', 'EMP-119', 'EMP-109'],
  },
  {
    id: 'team-platform',
    name: 'Platform & DevOps',
    shortName: 'DevOps',
    icon: 'Cloud',
    department: 'Platform',
    location: 'Pune & Bengaluru',
    leadId: 'EMP-106',
    leadName: 'Aarav Shah',
    leadRole: 'DevOps Lead',
    description: 'CI/CD deployment pipelines, cloud infrastructure, monitoring, security hardening, and disaster recovery.',
    activeProjects: [
      'Zero-Downtime Deployment Pipelines',
      'SOC-2 Compliance & Security Hardening',
      'Kubernetes Cluster Auto-Scaling',
    ],
    memberIds: ['EMP-106', 'EMP-112', 'EMP-121'],
  },
  {
    id: 'team-qa',
    name: 'Quality Assurance',
    shortName: 'QA & Testing',
    icon: 'CheckCircle2',
    department: 'Quality Assurance',
    location: 'Bengaluru HQ',
    leadId: 'EMP-102',
    leadName: 'Rahul Verma',
    leadRole: 'QA Lead',
    description: 'Automated regression testing suites, load testing, biometric punch verification, and end-to-end reliability.',
    activeProjects: [
      'Playwright E2E Integration Suite',
      'Payroll Edge-Case Stress Testing',
      'Mobile Responsive Cross-Browser Testing',
    ],
    memberIds: ['EMP-102', 'EMP-115', 'EMP-120'],
  },
  {
    id: 'team-design',
    name: 'Product Design & UI/UX',
    shortName: 'Design',
    icon: 'Palette',
    department: 'Product Design',
    location: 'Bengaluru HQ',
    leadId: 'EMP-103',
    leadName: 'Divya Menon',
    leadRole: 'UI/UX Designer',
    description: 'Design system components, UX research, user workflows, prototyping, and accessibility standards.',
    activeProjects: [
      'Dark Theme Monsoon Glass Styleguide',
      'Manager Dashboard Usability Research',
      'Employee Self-Service Mobile Wireframes',
    ],
    memberIds: ['EMP-103', 'EMP-113', 'EMP-123'],
  },
  {
    id: 'team-data',
    name: 'Data & Business Intelligence',
    shortName: 'Data & BI',
    icon: 'BarChart2',
    department: 'Data & BI',
    location: 'Pune & Hyderabad',
    leadId: 'EMP-110',
    leadName: 'Fatima Shaikh',
    leadRole: 'Senior Data Analyst',
    description: 'HR analytics, attendance predictive models, attrition risk scoring, and statutory compliance reporting.',
    activeProjects: [
      'Attendance Predictive Attrition Model',
      'Real-Time Overtime & Capacity Dashboard',
      'Statutory Compliance Export Generator',
    ],
    memberIds: ['EMP-110', 'EMP-116', 'EMP-124', 'EMP-105'],
  },
];

/**
 * Computes rich team stats given live employees list
 */
export function getTeamWithMembers(teamId, allEmployees = []) {
  const team = teamsData.find((t) => t.id === teamId);
  if (!team) return null;

  const members = allEmployees.filter((emp) => team.memberIds.includes(emp.id));

  // Compute live presence metrics
  const total = members.length;
  const inOffice = members.filter((m) => m.status === 'in-office').length;
  const remote = members.filter((m) => m.status === 'remote').length;
  const onLeave = members.filter((m) => m.status === 'on-leave').length;
  const notPunched = members.filter((m) => m.status === 'not-punched').length;
  const activeCount = inOffice + remote;

  // Average goals progress
  const totalGoals = members.reduce((acc, m) => acc + (m.goalsProgress || 0), 0);
  const avgGoals = total > 0 ? Math.round(totalGoals / total) : 0;

  // Average hours worked today
  const workedMembers = members.filter((m) => m.hoursDecimal > 0);
  const totalHours = workedMembers.reduce((acc, m) => acc + m.hoursDecimal, 0);
  const avgHoursNum = workedMembers.length > 0 ? totalHours / workedMembers.length : 0;
  const avgHoursFormatted = `${Math.floor(avgHoursNum)}h ${Math.round((avgHoursNum % 1) * 60)}m`;

  return {
    ...team,
    members,
    stats: {
      total,
      inOffice,
      remote,
      onLeave,
      notPunched,
      activeCount,
      activeRate: total > 0 ? Math.round((activeCount / total) * 100) : 0,
      avgGoals,
      avgHoursFormatted,
    },
  };
}

/**
 * Returns all teams with calculated stats
 */
export function getAllTeamsWithStats(allEmployees = []) {
  return teamsData.map((team) => getTeamWithMembers(team.id, allEmployees));
}

