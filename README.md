# HRMS Manager Dashboard — "Monsoon Glass"

> A modern, high-performance Human Resource Management System (HRMS) Manager Portal built with **React 18**, **Vite**, **Tailwind CSS**, and the **Monsoon Glass** design system.

---

## 📋 Table of Contents
- [Overview](#overview)
- [Design System: Monsoon Glass](#design-system-monsoon-glass)
- [Key Features & Modules](#key-features--modules)
  - [1. Main Dashboard & Notifications](#1-main-dashboard--notifications)
  - [2. People & Attendance Management](#2-people--attendance-management)
  - [3. Work & Performance](#3-work--performance)
  - [4. Finance, Compliance & Reports](#4-finance-compliance--reports)
  - [5. Account & Settings](#5-account--settings)
- [Attendance Rule Engine](#attendance-rule-engine)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Compliance & Privacy Rules](#compliance--privacy-rules)

---

## 🌟 Overview

The HRMS Manager Dashboard empowers engineering and team managers with real-time workforce visibility, punch tracking, leave approvals, sprint performance, and statutory compliance monitoring.

- **Target Persona:** Engineering Manager / Division Lead (managing 24 team members across Frontend, Backend, Platform, and QA).
- **Date Context:** Friday, 6 Nov 2026 (IST timezone, INR lakh/crore, Q3 FY26–27).
- **Core Principle:** Manager access is restricted to direct and indirect reports only. Individual salary figures, statutory PAN/Aadhaar numbers, and sensitive tax information remain strictly hidden.

---

## 🎨 Design System: Monsoon Glass

Built adhering strictly to the **Monsoon Glass** design specifications:
- **Theme:** Dark mode only with deep midnight teal/indigo gradients.
- **Surface & Cards:** Frosted glassmorphism (`backdrop-filter: blur(16px)`), subtle translucent borders (`var(--line)`), 22px corner radius (`var(--radius)`), and 20px card padding.
- **Typography:**
  - **Headings & KPI Digits:** `Syne` (600, 700, 800)
  - **Body & Data:** `Manrope` (tabular numbers for dates, times, and durations)
- **Tokenized Palette:** All colors use CSS variables (`--bg`, `--surface`, `--surface2`, `--line`, `--ink`, `--muted`, `--accent`, `--accent2`, `--good`, `--warn`, `--bad`).
- **Accent Modes:** Quick switch between **Amber** (`#f97316`) and **Mint** (`#10b981`).
- **Icons:** Standardized SVG icons via `lucide-react` (24px viewBox, stroke width 1.8). No emoji icons.

---

## 🚀 Key Features & Modules

### 1. Main Dashboard & Notifications
- **Overview (`/dashboard`):**
  - **Live Punch Status:** Manager's own check-in/check-out status banner with 1-click punch.
  - **KPI Metrics:** Present count, on-leave, pending approval queues, OKR velocity, and payroll cutoff countdown.
  - **Attendance Trend:** 14-day interactive visual trend chart.
  - **Quick Approvals:** Actionable cards with Undo toast notifications.
- **Notifications (`/dashboard/notifications`):**
  - Full-page notification center + Header slide-out bell drawer.
  - Filtering by category (Approvals, System, Reminders, Shifts).
  - Batch actions: *Mark all as read*, *Approve all pending*.

### 2. People & Attendance Management
- **Attendance (`/dashboard/attendance`):**
  - **Manager's Attendance:** Full punch system supporting **Office**, **WFH**, and **Remote** modes with live timer, lunch/tea break tracker, and instant punch reset for simulation.
  - **Team Daily Attendance:** Live status roster (In-office, Remote, On-leave, Not punched), working hours progress bars against 9h goal, overtime rankings, and CSV export.
  - **Monthly Attendance History:** Switchable between interactive Calendar grid and detailed Table view with one-click regularisation requests.
- **Leave Requests (`/dashboard/leave`):**
  - Pending approval cards (Casual, Sick, Privilege leaves).
  - One-click *Approve* / *Reject* with reversible Undo toast.
  - Monthly team leave calendar with color-coded tags.
- **Team Directory (`/dashboard/team`):**
  - 24-person engineering roster with real-time search and department filters.
  - Direct vs. Indirect report tagging.
  - Detailed Employee Drawer with contact info, tenure, and 1:1 meeting shortcuts.
- **Shifts & Rota (`/dashboard/shifts`):**
  - Weekly shift schedule (General 9:30–18:30, Morning, Evening, On-call).
  - Coverage analysis and shift swap requests.
- **Documents (`/dashboard/documents`):**
  - Team statutory documents, compliance certificates, and offer letters.
  - Audit logging on every encrypted file view/download.

### 3. Work & Performance
- **Performance Management (`/dashboard/performance`):**
  - **OKRs & Goals:** Objective progress bars, key result check-in modal with slider.
  - **1:1 Meetings:** Scheduled meetings, agenda items, and schedule 1:1 modal.
  - **Appraisals & Reviews:** 9-box talent matrix and self/manager review cycle.
  - **Skill Matrix:** Skill proficiencies across languages, frameworks, and tools.
  - **PIPs & Growth Plans:** Active development plans with milestone milestones.
- **Tasks & Workload (`/dashboard/tasks`):**
  - Sprint workload balance, task distribution by engineer, priority badges.
- **Meetings & Calendar (`/dashboard/meetings`):**
  - Daily/weekly schedule view with meeting room links.
- **Announcements (`/dashboard/announcements`):**
  - Division-wide updates, holiday notices, and policy announcements.

### 4. Finance, Compliance & Reports
- **Payroll & Compliance (`/dashboard/payroll`):**
  - Monthly salary processing cycle checklist (PF, ESIC, PT, TDS).
  - Missing UAN resolution modal with instant verification.
  - State-wise Professional Tax (PT) slab viewer.
  - **Confidentiality:** Individual salaries are hidden; only aggregate division figures are displayed.
- **Reports & Analytics (`/dashboard/reports`):**
  - Attendance trends, leave utilization, overtime distribution.
  - Export capabilities to CSV and print-ready PDF.

### 5. Account & Settings
- **Profile (`/dashboard/profile`):**
  - Manager's profile, contact details, reporting chain.
  - Personal details editable; corporate details read-only with "Request change" flow.
- **Settings (`/dashboard/settings`):**
  - Density toggle: **Comfortable** vs **Compact**.
  - Notification channel preferences (Email, In-App, Slack).
  - Active sessions & security log.
  - Keyboard shortcuts drawer (`Ctrl + K` global search, navigation hotkeys).

---

## 📍 Mandatory GPS Tracking & Geofencing System

Every check-in and check-out requires verified GPS coordinates to prevent buddy punching and enforce location integrity:

### 1. How It Works
1. **Device GPS Acquisition (`src/utils/geoUtils.js`):**
   - Uses the browser's `navigator.geolocation.getCurrentPosition` with `enableHighAccuracy: true`.
   - Captures high-accuracy decimal latitude, longitude, timestamp, and device accuracy in meters (e.g., `±8m`).
   - If the user denies browser GPS or runs on unsupported hardware, the system provides high-fidelity simulated fallback coordinates near the office so developers/managers are never locked out of testing.
2. **Haversine Geofence Verification:**
   - Evaluates the spherical distance between the user's coordinates and the assigned office coordinates (e.g. Bengaluru HQ, Hyderabad Campus, or Pune Hub).
   - If `distance <= officeGeoRadiusMeters` (default: 200m), the punch is verified as **`Inside Geofence`**.
   - If `distance > 200m` while claiming **Office** mode, the punch is recorded with a **`Location Mismatch`** flag.
   - For **Work from home (WFH)** and **Remote** modes, the exact home/remote GPS coordinates are recorded and stamped with `Remote-Verified`.
3. **Checkout Tracking:**
   - Departure check-outs capture exit GPS coordinates (`punchOutGps`) and verify geofence exit integrity.
4. **Interactive SVG Radar Visualizer:**
   - Clicking any employee's GPS badge in the Team Attendance table opens the **GPS Attendance Verification Modal** (`GpsLocationModal.jsx`).
   - Displays an animated concentric radar (50m, 100m, 200m boundary), the central office beacon, and the employee's exact punch pin with distance measurement.

---

## ⏱ Attendance Rule Engine

The client-side rules engine in [`src/utils/attendanceEngine.js`](src/utils/attendanceEngine.js) computes all daily attendance statuses automatically:
- **Shift Timing:** General Shift 09:30 – 18:30 (9 hours total).
- **Grace Period:** Arrival up to 09:45 is considered **On time**.
- **Late Arrival:** Arrival between 09:46 – 10:30 marks **Late arrival**.
- **Half Day / Short Hours:** Working between 4h 30m and 8h net marks **Short hours**. Less than 4h 30m marks **Absent**.
- **Early Departure:** Leaving before 18:15 with <8h net work flags early departure.
- **Breaks:** Total allowed breaks: 75 minutes. Excess break time is automatically flagged.
- **Overtime:** Net hours exceeding 9h are counted toward overtime.

All rules are verified via 14 automated unit tests:
```bash
node --test src/utils/attendanceEngine.test.js
```

---

## 🛠 Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 18** | UI framework with hooks and Context API |
| **Vite 5** | High-speed frontend tooling and bundler |
| **Tailwind CSS 3** | Utility-first CSS using CSS variable design tokens |
| **Lucide React** | Clean, accessible SVG icons |
| **Node.js Native Test Runner** | Fast, zero-dependency unit tests for business logic |
| **HTML5 History API** | SPA routing with URL sync (`/dashboard/*`) |
| **Web Storage (localStorage)** | Client-side state persistence for mock backend |

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or pnpm

### Installation
```bash
# 1. Clone or open the repository folder
cd "HRMS frontend/Manager Dashboard"

# 2. Install dependencies
npm install
```

### Development Mode
Runs the local Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open **http://localhost:5173** in your browser.

### Production Build & Server
Build the optimized static assets and serve them via the custom Node.js production server:
```bash
# Build production bundle to dist/
npm run build

# Start production server on port 3000
npm start
```
Open **http://localhost:3000** in your browser.

### Run Unit Tests
```bash
npm test
# Or run test directly:
node --test src/utils/attendanceEngine.test.js
```

---

## 📂 Project Structure

```
Manager Dashboard/
├── dist/                          # Production build output
├── public/                        # Static assets
├── src/
│   ├── components/                # Reusable UI components
│   │   ├── attendance/            # Attendance subcomponents (TodayPanel, BreakTracker, etc.)
│   │   ├── Avatar.jsx             # User initials avatar
│   │   ├── Card.jsx               # Monsoon Glass card container
│   │   ├── Drawer.jsx             # Slide-over drawer dialog
│   │   ├── Header.jsx             # App header with search, punch & account menu
│   │   ├── Rail.jsx               # 236px left navigation rail
│   │   ├── StatusPill.jsx         # Status badge pill (Present, Late, Absent, etc.)
│   │   ├── Table.jsx              # Responsive data table with sticky columns
│   │   ├── Toast.jsx              # Action notification with Undo
│   │   └── ...
│   ├── config/
│   │   └── attendanceRules.js     # Configurable attendance policy limits
│   ├── context/
│   │   ├── AttendanceContext.jsx  # Context for punches, breaks & live timer
│   │   └── AuthContext.jsx        # User authentication & preferences
│   ├── data/
│   │   ├── manager.js             # 24-person team data, KPIs & mock requests
│   │   ├── myAttendance.js        # Historical month data & initial punch seed
│   │   └── profile.js             # Manager profile defaults
│   ├── pages/                     # Routed pages (Overview, Attendance, Leave, etc.)
│   ├── services/
│   │   ├── attendanceService.js   # Attendance data persistence service
│   │   └── profileService.js      # Profile update service
│   ├── store/
│   │   └── NotificationContext.js # Notification center state
│   ├── styles/
│   │   ├── base.css               # Global base styles, background gradients & scrollbars
│   │   └── tokens.css             # Monsoon Glass design tokens
│   ├── utils/
│   │   ├── attendanceEngine.js    # Rule evaluation engine
│   │   ├── attendanceEngine.test.js # 14 unit tests for rules
│   │   └── exportUtils.js         # CSV & report generation
│   ├── App.jsx                    # Root application component & routing
│   └── main.jsx                   # Entry point
├── index.html                     # HTML root template
├── server.js                      # Custom SPA production HTTP server
├── tailwind.config.js             # Tailwind CSS configuration
├── vite.config.js                 # Vite bundler configuration
└── package.json                   # Project metadata & scripts
```

---

## 🔒 Compliance & Privacy Rules

1. **Manager Visibility Boundary:**
   - Managers have visibility strictly into direct and indirect subordinates.
   - Cross-division employees are not accessible.
2. **Salary Confidentiality:**
   - Individual compensation, bonus structures, bank accounts, and PAN cards are omitted by design.
   - Only division-level aggregates and compliance check statuses are shown.
3. **Statutory Integrity:**
   - Statutory calculations (Provident Fund, ESIC, Professional Tax, TDS) adhere to Indian regulatory guidelines for FY 2026–27.

