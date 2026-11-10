import React, { useState } from 'react';
import Card from '../Card';
import Avatar from '../Avatar';
import StatusPill from '../StatusPill';
import Tag from '../Tag';
import Progress from '../Progress';
import Tabs from '../Tabs';
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
  Target,
  Calendar,
  MessageSquare,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Cake,
  Award,
  Layers,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Search,
  X,
} from 'lucide-react';

export default function TeamDetailView({
  team,
  allTeams = [],
  onBack,
  onSelectTeam,
  onSelectEmployee,
  onTriggerToast,
  teamLife,
}) {
  const [memberFilter, setMemberFilter] = useState('all');
  const [memberSearch, setMemberSearch] = useState('');

  const { stats, members } = team;

  // Filter members
  const filteredMembers = members.filter((m) => {
    // Tab filter
    if (memberFilter === 'in-office' && m.status !== 'in-office') return false;
    if (memberFilter === 'remote' && m.status !== 'remote') return false;
    if (memberFilter === 'on-leave' && m.status !== 'on-leave') return false;
    if (memberFilter === 'not-punched' && m.status !== 'not-punched') return false;

    // Search query
    if (memberSearch.trim()) {
      const q = memberSearch.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const memberTabs = [
    { id: 'all', label: 'All', count: members.length },
    { id: 'in-office', label: 'In-Office', count: stats.inOffice },
    { id: 'remote', label: 'Remote', count: stats.remote },
    { id: 'on-leave', label: 'On Leave', count: stats.onLeave },
    ...(stats.notPunched > 0 ? [{ id: 'not-punched', label: 'Not Punched', count: stats.notPunched }] : []),
  ];

  // Team-specific life events (birthdays / anniversaries)
  const teamMemberNames = members.map((m) => m.name);
  const teamBirthdays = teamLife?.birthdays?.filter((b) => teamMemberNames.includes(b.name)) || [];
  const teamAnniversaries = teamLife?.anniversaries?.filter((a) => teamMemberNames.includes(a.name)) || [];
  const teamProbations = members.filter((m) => m.isProbation);

  return (
    <div className="flex flex-col gap-5 w-full animate-in fade-in duration-200">
      {/* 1. Header Navigation Bar & Quick Switcher */}
      <div className="flex flex-col gap-3 pb-2 border-b border-line/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Back button & Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface2 border border-line text-ink text-[12.5px] font-semibold hover:border-accent hover:text-accent transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <ArrowLeft size={14} />
              <span>All Teams</span>
            </button>

            <span className="text-muted/60 font-mono">/</span>

            <div className="flex items-center gap-2">
              <span className="text-[13px] font-display font-bold text-ink">
                {team.name}
              </span>
              <Tag>{team.department}</Tag>
            </div>
          </div>

          {/* Quick Team Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onTriggerToast && onTriggerToast(`Scheduled 30m team standup for ${team.name} 📅`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface2 border border-line text-ink text-[12px] font-semibold hover:border-accent transition-all active:scale-95 shadow-sm"
            >
              <Calendar size={13} className="text-accent" />
              <span>Team Sync</span>
            </button>

            <button
              type="button"
              onClick={() => onTriggerToast && onTriggerToast(`Sent attendance ping to ${team.name} members 🔔`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display font-bold text-[12px] hover:brightness-110 transition-all active:scale-95 shadow-sm"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--on-accent)',
              }}
            >
              <MessageSquare size={13} />
              <span>Ping Team</span>
            </button>
          </div>
        </div>

        {/* Quick Team Switcher Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-[12px]">
          <span className="text-[11px] font-mono text-muted uppercase tracking-wider shrink-0 mr-1">
            Jump to:
          </span>
          {allTeams.map((t) => {
            const isCurrent = t.id === team.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectTeam(t)}
                className={`px-3 py-1 rounded-full whitespace-nowrap font-medium text-[12px] transition-all border ${
                  isCurrent
                    ? 'bg-accent/20 border-accent text-accent font-semibold shadow-sm'
                    : 'bg-surface2/60 border-line text-muted hover:text-ink hover:bg-surface2'
                }`}
              >
                {t.shortName} ({t.stats.total})
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Team Overview Hero Card */}
      <div className="glass-card p-5 rounded-[var(--radius)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-center">
          {/* Left: Info & Description */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent font-mono">
                {team.department} Pod
              </span>
              <span className="text-line">·</span>
              <span className="text-[12px] text-muted flex items-center gap-1">
                <MapPin size={12} className="text-muted" />
                {team.location}
              </span>
            </div>

            <h2
              className="font-display font-bold text-ink tracking-tight leading-tight"
              style={{ fontSize: 'clamp(22px, 2.6vw, 30px)' }}
            >
              {team.name}
            </h2>

            <p className="text-[13.5px] text-muted leading-relaxed max-w-[65ch]">
              {team.description}
            </p>

            {/* Team Lead Badge */}
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-surface2/50 border border-line/60 w-fit">
              <Avatar name={team.leadName} size={32} />
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-muted uppercase">Team Lead & Contact</span>
                <span className="text-[13px] font-bold text-ink">{team.leadName}</span>
                <span className="text-[11px] text-muted">{team.leadRole}</span>
              </div>
            </div>
          </div>

          {/* Right: Active Projects & Focus */}
          <div className="flex flex-col gap-3 bg-surface2/40 p-4 rounded-xl border border-line/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted font-mono flex items-center gap-1.5">
                <Sparkles size={12} className="text-accent" />
                Active Q3 Deliverables
              </span>
              <span className="text-[11px] font-mono font-bold text-ink">
                {team.activeProjects.length} Projects
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {team.activeProjects.map((proj, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-[12px] p-2 rounded-lg bg-surface2/60 border border-line/40 text-ink"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                  <span className="font-medium">{proj}</span>
                </div>
              ))}
            </div>

            {/* Average Goal Progress */}
            <div className="flex flex-col gap-1.5 pt-1 border-t border-line/40">
              <div className="flex items-center justify-between text-[11.5px]">
                <span className="text-muted">Sprint Progress</span>
                <span className="font-mono font-bold text-ink">{stats.avgGoals}% On Track</span>
              </div>
              <Progress value={stats.avgGoals} max={100} height={6} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Team KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-[var(--gap)]">
        <div className="glass-card p-3 flex flex-col gap-1">
          <span className="text-[10.5px] uppercase font-mono text-muted tracking-wider">Total Members</span>
          <span className="font-display font-bold text-[22px] text-ink">{stats.total}</span>
          <span className="text-[10.5px] text-muted font-mono">Engineers</span>
        </div>

        <div className="glass-card p-3 flex flex-col gap-1">
          <span className="text-[10.5px] uppercase font-mono text-muted tracking-wider">In-Office</span>
          <span className="font-display font-bold text-[22px] text-good">{stats.inOffice}</span>
          <span className="text-[10.5px] text-muted font-mono">Physical desks</span>
        </div>

        <div className="glass-card p-3 flex flex-col gap-1">
          <span className="text-[10.5px] uppercase font-mono text-muted tracking-wider">Remote</span>
          <span className="font-display font-bold text-[22px] text-ink">{stats.remote}</span>
          <span className="text-[10.5px] text-muted font-mono">WFH Active</span>
        </div>

        <div className="glass-card p-3 flex flex-col gap-1">
          <span className="text-[10.5px] uppercase font-mono text-muted tracking-wider">On Leave</span>
          <span className="font-display font-bold text-[22px] text-warn">{stats.onLeave}</span>
          <span className="text-[10.5px] text-muted font-mono">{stats.onLeave > 0 ? 'Approved leave' : 'All available'}</span>
        </div>

        <div className="glass-card p-3 flex flex-col gap-1">
          <span className="text-[10.5px] uppercase font-mono text-muted tracking-wider">Avg Daily Hours</span>
          <span className="font-display font-bold text-[22px] text-ink tabular-nums">{stats.avgHoursFormatted}</span>
          <span className="text-[10.5px] text-good font-mono font-semibold">vs 9h shift</span>
        </div>

        <div className="glass-card p-3 flex flex-col gap-1">
          <span className="text-[10.5px] uppercase font-mono text-muted tracking-wider">Attendance Rate</span>
          <span className="font-display font-bold text-[22px] text-accent tabular-nums">{stats.activeRate}%</span>
          <span className="text-[10.5px] text-muted font-mono">{stats.activeCount} of {stats.total} present</span>
        </div>
      </div>

      {/* 4. Two-Column Main Content: Members List & Team Milestones */}
      <div className="standard-grid-2col w-full">
        {/* Left (Column 1): Team Members Directory */}
        <div className="grid-col-span-1">
          <Card
            dataW="team-members"
            title={`${team.name} Members`}
            subtitle={`${filteredMembers.length} of ${members.length} team members · click member for full details`}
            headerAction={
              <Tabs
                tabs={memberTabs}
                activeId={memberFilter}
                onChange={setMemberFilter}
                size="sm"
              />
            }
          >
            {/* Search within team */}
            <div className="relative w-full">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Filter by name, role or employee ID..."
                className="w-full bg-surface2 border border-line rounded-full py-1.5 pl-8 pr-8 text-[12.5px] text-ink placeholder-muted focus:outline-none focus:border-accent transition-colors"
              />
              {memberSearch && (
                <button
                  type="button"
                  onClick={() => setMemberSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink p-1 cursor-pointer"
                  title="Clear search"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Members List */}
            <div className="flex flex-col divide-y divide-dashed divide-line max-h-[560px] overflow-y-auto pr-1">
              {filteredMembers.map((emp) => {
                let extraText = '';
                if (emp.status === 'in-office' || emp.status === 'remote') {
                  extraText = emp.punchIn !== '—' ? emp.punchIn : '';
                }

                return (
                  <div
                    key={emp.id}
                    onClick={() => onSelectEmployee(emp)}
                    className="py-3 flex items-center justify-between gap-3 px-2 rounded-lg hover:bg-surface2/40 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={emp.name} size={36} />
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[13.5px] text-ink group-hover:text-accent transition-colors truncate">
                            {emp.name}
                          </span>
                          {emp.id === team.leadId && (
                            <Tag>Lead</Tag>
                          )}
                          {emp.isProbation && <Tag>Probation</Tag>}
                        </div>
                        <span className="text-[11.5px] text-muted truncate">
                          {emp.role} · {emp.location} · <span className="font-mono">{emp.id}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="hidden sm:flex flex-col items-end text-[11px] font-mono">
                        <span className="text-ink font-semibold">{emp.hoursWorked}</span>
                        <span className="text-muted">{emp.goalsProgress}% goals</span>
                      </div>
                      <StatusPill status={emp.status} extraText={extraText} />
                      <ChevronRight size={14} className="text-muted/60 group-hover:text-accent transition-colors hidden sm:block" />
                    </div>
                  </div>
                );
              })}

              {filteredMembers.length === 0 && (
                <div className="py-12 text-center text-muted italic text-[13px]">
                  No team members found under this filter.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right (Column 2): Team Pulse, Milestones & Skills */}
        <div className="grid-col-span-1 flex flex-col gap-[var(--gap)]">
          {/* Team Life & Celebrations */}
          <Card
            dataW="team-life"
            title="Team milestones & events"
            subtitle={`Upcoming events for ${team.name}`}
          >
            <div className="flex flex-col gap-3">
              {/* Birthdays */}
              <div className="p-3 rounded-xl bg-surface2/50 border border-line flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-accent text-[12px] font-semibold">
                  <Cake size={14} />
                  <span>Team Birthdays</span>
                </div>
                {teamBirthdays.length > 0 ? (
                  teamBirthdays.map((b, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[12px] pt-1 border-t border-line/30 first:border-0 first:pt-0">
                      <div className="flex flex-col">
                        <span className="font-medium text-ink">{b.name}</span>
                        <span className="text-muted text-[11px] font-mono">{b.date}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onTriggerToast && onTriggerToast(`Birthday greeting sent to ${b.name}! 🎂`)}
                        className="px-2 py-0.5 rounded bg-accent/20 hover:bg-accent hover:text-on-accent text-accent text-[10.5px] font-bold border border-accent/30 transition-all active:scale-95"
                      >
                        Wish 🎉
                      </button>
                    </div>
                  ))
                ) : (
                  <span className="text-[12px] text-muted italic">No upcoming birthdays in this pod</span>
                )}
              </div>

              {/* Anniversaries */}
              <div className="p-3 rounded-xl bg-surface2/50 border border-line flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-accent2 text-[12px] font-semibold">
                  <Award size={14} />
                  <span>Work Anniversaries</span>
                </div>
                {teamAnniversaries.length > 0 ? (
                  teamAnniversaries.map((a, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[12px] pt-1 border-t border-line/30 first:border-0 first:pt-0">
                      <div className="flex flex-col">
                        <span className="font-medium text-ink">{a.name}</span>
                        <span className="text-muted text-[11px] font-mono">{a.date} ({a.years})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onTriggerToast && onTriggerToast(`Congratulated ${a.name} on ${a.years}! 🏆`)}
                        className="px-2 py-0.5 rounded bg-accent2/20 hover:bg-accent2 hover:text-white text-accent2 text-[10.5px] font-bold border border-accent2/30 transition-all active:scale-95"
                      >
                        Congratulate 🏆
                      </button>
                    </div>
                  ))
                ) : (
                  <span className="text-[12px] text-muted italic">No upcoming anniversaries in this pod</span>
                )}
              </div>

              {/* Probation Alerts in this team */}
              {teamProbations.length > 0 && (
                <div className="p-3 rounded-xl bg-surface2/40 border border-warn/30 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-warn flex items-center gap-1.5">
                      <AlertTriangle size={13} />
                      Probation Review Due
                    </span>
                    <span className="text-[11px] font-mono text-warn">9 days left</span>
                  </div>
                  {teamProbations.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-[12px]">
                      <span className="text-ink font-semibold">{m.name}</span>
                      <button
                        type="button"
                        onClick={() => onTriggerToast && onTriggerToast(`Initiated probation confirmation for ${m.name}`)}
                        className="text-[11px] text-accent hover:underline font-semibold"
                      >
                        Confirm →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Team Responsibilities & Compliance Info */}
          <Card
            dataW="team-statutory"
            title="Manager Oversight"
            subtitle="Access & compliance summary for this pod"
          >
            <div className="flex flex-col gap-2.5 text-[12px]">
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface2/50 border border-line">
                <span className="text-muted">Total Direct Reports in Pod</span>
                <span className="font-mono font-bold text-ink">
                  {members.filter((m) => m.reporting === 'Direct').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface2/50 border border-line">
                <span className="text-muted">Indirect Reports</span>
                <span className="font-mono font-bold text-ink">
                  {members.filter((m) => m.reporting === 'Indirect').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface2/50 border border-line">
                <span className="text-muted">Salaries & Compensation</span>
                <span className="text-warn font-semibold">Restricted (HR Only)</span>
              </div>

              <div className="p-3 rounded-xl bg-surface2/30 border border-line/60 flex items-center gap-2.5 text-muted text-[11.5px] mt-1">
                <ShieldCheck size={16} className="text-good shrink-0" />
                <span>All {members.length} member profiles comply with corporate PF/UAN & Attendance regulations.</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

