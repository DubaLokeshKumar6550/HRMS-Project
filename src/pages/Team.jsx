import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/Card';
import Tabs from '../components/Tabs';
import StatusPill from '../components/StatusPill';
import Tag from '../components/Tag';
import Avatar from '../components/Avatar';
import Progress from '../components/Progress';
import TeamCard from '../components/team/TeamCard';
import TeamDetailView from '../components/team/TeamDetailView';
import { getAllTeamsWithStats, getTeamWithMembers } from '../data/teams';
import {
  Search,
  Cake,
  Award,
  AlertTriangle,
  UserPlus,
  GraduationCap,
  Briefcase,
  ChevronRight,
  ShieldAlert,
  Users,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';

export default function Team({
  employees,
  onSelectEmployee,
  teamLife,
  searchQuery,
  onSearchChange,
  onTriggerToast,
}) {
  // View mode: 'teams' (Team-wise, recommended default) or 'directory' (all 24 members flat list)
  const [viewMode, setViewMode] = useState('teams');

  // Selected team ID for deep dive into team details
  const [selectedTeamId, setSelectedTeamId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('team') || null;
  });

  // Department filter for teams grid
  const [deptFilter, setDeptFilter] = useState('All');

  // State filter for flat directory
  const [selectedState, setSelectedState] = useState('All');
  const [internalSearch, setInternalSearch] = useState('');

  // Synchronize URL popstate (back/forward button)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setSelectedTeamId(params.get('team') || null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Compute all teams with live stats
  const allTeams = useMemo(() => {
    return getAllTeamsWithStats(employees);
  }, [employees]);

  // Selected team object if a team is clicked
  const selectedTeam = useMemo(() => {
    if (!selectedTeamId) return null;
    return getTeamWithMembers(selectedTeamId, employees);
  }, [selectedTeamId, employees]);

  // Handler to select a team and update URL query
  const handleSelectTeam = (team) => {
    const id = team ? team.id : null;
    setSelectedTeamId(id);
    const url = new URL(window.location);
    if (id) {
      url.searchParams.set('team', id);
    } else {
      url.searchParams.delete('team');
    }
    window.history.pushState(null, '', url.toString());
  };

  const stateTabs = [
    { id: 'All', label: 'All States' },
    { id: 'Karnataka', label: 'Karnataka' },
    { id: 'Telangana', label: 'Telangana' },
    { id: 'Maharashtra', label: 'Maharashtra' },
  ];

  const deptTabs = [
    { id: 'All', label: 'All Pods', count: allTeams.length },
    { id: 'Engineering', label: 'Engineering' },
    { id: 'Platform', label: 'Platform & DevOps' },
    { id: 'Quality Assurance', label: 'QA' },
    { id: 'Product Design', label: 'Design' },
    { id: 'Data & BI', label: 'Data' },
  ];

  // Combined search (from header or local card search)
  const activeSearch = (internalSearch || searchQuery || '').trim();

  // Filtered teams list
  const filteredTeams = allTeams.filter((t) => {
    if (deptFilter !== 'All' && t.department !== deptFilter) return false;
    if (activeSearch) {
      const q = activeSearch.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchLead = t.leadName.toLowerCase().includes(q);
      const matchShort = t.shortName.toLowerCase().includes(q);
      const matchDept = t.department.toLowerCase().includes(q);
      const matchProj = t.activeProjects.some((p) => p.toLowerCase().includes(q));
      return matchName || matchLead || matchShort || matchDept || matchProj;
    }
    return true;
  });

  const filteredEmployees = employees.filter((emp) => {
    // State filter
    if (selectedState !== 'All' && emp.state !== selectedState) {
      return false;
    }
    // Search query
    if (activeSearch.trim()) {
      const q = activeSearch.toLowerCase();
      const matchName = emp.name.toLowerCase().includes(q);
      const matchRole = emp.role.toLowerCase().includes(q);
      const matchLoc = emp.location.toLowerCase().includes(q);
      const matchDept = emp.department.toLowerCase().includes(q);
      return matchName || matchRole || matchLoc || matchDept;
    }
    return true;
  });

  // IF A TEAM IS SELECTED -> Render Full Team Detail View!
  if (selectedTeam) {
    return (
      <TeamDetailView
        team={selectedTeam}
        allTeams={allTeams}
        onBack={() => handleSelectTeam(null)}
        onSelectTeam={handleSelectTeam}
        onSelectEmployee={onSelectEmployee}
        onTriggerToast={onTriggerToast}
        teamLife={teamLife}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Top View Mode Switcher Pill Tabs: Team-wise vs All Members */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-line/40 select-none">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('teams')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all border ${
              viewMode === 'teams'
                ? 'bg-surface2 text-ink border-line shadow-sm'
                : 'text-muted border-transparent hover:text-ink hover:bg-surface2/60'
            }`}
          >
            <Layers size={14} className={viewMode === 'teams' ? 'text-accent' : 'text-muted'} />
            <span>Team-wise View ({allTeams.length} Pods)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('directory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all border ${
              viewMode === 'directory'
                ? 'bg-surface2 text-ink border-line shadow-sm'
                : 'text-muted border-transparent hover:text-ink hover:bg-surface2/60'
            }`}
          >
            <Users size={14} className={viewMode === 'directory' ? 'text-accent' : 'text-muted'} />
            <span>All Employees ({employees.length} Members)</span>
          </button>
        </div>

        <div className="text-[12px] text-muted font-mono hidden md:block">
          Click any team card below to view team members & stats
        </div>
      </div>

      {/* VIEW MODE 1: TEAM-WISE VIEW (PRIMARY) */}
      {viewMode === 'teams' ? (
        <div className="standard-grid-2col w-full">
          {/* Left Column (grid-col-span-1): Teams Grid & Department Filter */}
          <div className="grid-col-span-1 flex flex-col gap-4">
            <Card
              dataW="team-pods"
              title="Engineering Teams & Pods"
              subtitle="6 functional teams under Lokesh Kumar · Click a team to view team details"
              headerAction={
                <Tabs
                  tabs={deptTabs}
                  activeId={deptFilter}
                  onChange={setDeptFilter}
                  size="sm"
                />
              }
            >
              {/* Search teams by name or lead */}
              <div className="relative w-full">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                />
                <input
                  type="text"
                  value={internalSearch}
                  onChange={(e) => setInternalSearch(e.target.value)}
                  placeholder="Search team name, lead, or deliverable..."
                  className="w-full bg-surface2 border border-line rounded-full py-1.5 pl-8 pr-8 text-[12.5px] text-ink placeholder-muted focus:outline-none focus:border-accent transition-colors"
                />
                {internalSearch && (
                  <button
                    type="button"
                    onClick={() => setInternalSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink p-1 cursor-pointer"
                    title="Clear search"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Grid of Team Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {filteredTeams.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    onSelectTeam={handleSelectTeam}
                  />
                ))}

                {filteredTeams.length === 0 && (
                  <div className="col-span-2 py-12 text-center text-muted italic text-[13px]">
                    No functional pods match your search filter.
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column (grid-col-span-1): Team Life & Milestones */}
          <div className="grid-col-span-1 flex flex-col gap-[var(--gap)]">
            {/* Quick Pods Summary breakdown */}
            <Card
              dataW="team-distribution"
              title="Pod Capacity & Allocation"
              subtitle="Headcount and active presence across all 6 teams"
            >
              <div className="flex flex-col divide-y divide-dashed divide-line text-[12.5px]">
                {allTeams.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTeam(t)}
                    className="py-2.5 flex items-center justify-between hover:bg-surface2/30 px-2 rounded-lg cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-ink group-hover:text-accent transition-colors truncate">
                          {t.name}
                        </span>
                        <span className="text-[11px] text-muted">
                          Lead: {t.leadName} · {t.location}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5 font-mono text-[11.5px]">
                        <span className="text-good font-bold">{t.stats.activeCount} active</span>
                        <span className="text-muted">/ {t.stats.total}</span>
                      </div>
                      <span className="text-accent group-hover:translate-x-0.5 transition-transform text-[12px] font-bold">
                        →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Team Life: Birthdays, Anniversaries, Probation */}
            <Card
              dataW="life"
              title="Team life & milestones"
              subtitle="Celebrations, onboarding, and probation reviews"
            >
              {/* Birthdays & Anniversaries */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-surface2/50 border border-line flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-accent text-[12px] font-semibold">
                    <Cake size={14} />
                    <span>Upcoming Birthdays</span>
                  </div>
                  {teamLife.birthdays.map((b, idx) => (
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
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-surface2/50 border border-line flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-accent2 text-[12px] font-semibold">
                    <Award size={14} />
                    <span>Work Anniversaries</span>
                  </div>
                  {teamLife.anniversaries.map((a, idx) => (
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
                  ))}
                </div>
              </div>

              {/* Probation Review Alert */}
              <div className="p-3 rounded-xl bg-surface2/40 border border-warn/30 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-warn flex items-center gap-1.5">
                    <AlertTriangle size={13} />
                    Probation Confirmation Due
                  </span>
                  <span className="text-[11px] font-mono text-warn">9 days left</span>
                </div>
                {teamLife.probationsDue.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[12.5px] pt-1">
                    <span className="font-bold text-ink">
                      {p.name} ({p.role})
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted text-[11px]">Due {p.dueDate}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const emp = employees.find(e => e.name === p.name);
                          if (emp) onSelectEmployee(emp);
                        }}
                        className="px-2 py-0.5 rounded bg-warn text-black text-[10.5px] font-bold hover:brightness-110 active:scale-95 transition-all"
                      >
                        Open Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Open Hiring Requests */}
              <div className="flex flex-col gap-2 pt-2 border-t border-line/40">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                    <Briefcase size={13} />
                    Open Hiring Requisitions
                  </span>
                  <span className="text-[11px] text-accent font-semibold">2 Active</span>
                </div>

                <div className="flex flex-col gap-2">
                  {teamLife.openHiring.map((h, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-surface2/30 border border-line flex items-center justify-between text-[12px]"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-ink">{h.role}</span>
                        <span className="text-muted text-[11px]">{h.stage}</span>
                      </div>
                      <Tag>{h.applicants} candidates</Tag>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mandatory Compliance Training */}
              <div className="flex flex-col gap-2 pt-2 border-t border-line/40">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-muted flex items-center gap-1.5 font-medium">
                    <GraduationCap size={14} className="text-accent" />
                    {teamLife.trainingProgress.title}
                  </span>
                  <span className="font-mono font-bold text-ink">
                    {teamLife.trainingProgress.completed} / {teamLife.trainingProgress.total} (84%)
                  </span>
                </div>
                <Progress value={teamLife.trainingProgress.percentage} max={100} height={7} />
              </div>
            </Card>
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: ALL EMPLOYEES FLAT DIRECTORY */
        <div className="standard-grid-2col w-full">
          {/* 1. Team Directory Widget (grid-col-span-1) matching Screenshot 3 */}
          <div className="grid-col-span-1">
            <Card
              dataW="team"
              title="All Employees Directory"
              subtitle={`${filteredEmployees.length} of ${employees.length} · salaries are hidden from managers`}
            >
              {/* Search bar inside card (as in Screenshot 3) */}
              <div className="relative w-full">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                />
                <input
                  type="text"
                  value={internalSearch}
                  onChange={(e) => setInternalSearch(e.target.value)}
                  placeholder="Search name, role, department or location..."
                  className="w-full bg-surface2 border border-line rounded-full py-1.5 pl-8 pr-8 text-[12.5px] text-ink placeholder-muted focus:outline-none focus:border-accent transition-colors"
                />
                {internalSearch && (
                  <button
                    type="button"
                    onClick={() => setInternalSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink p-1 cursor-pointer"
                    title="Clear search"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Location state filter pills (as in Screenshot 3) */}
              <Tabs
                tabs={stateTabs}
                activeId={selectedState}
                onChange={setSelectedState}
                size="sm"
              />

              {/* Employee List (as in Screenshot 3) */}
              <div className="flex flex-col divide-y divide-dashed divide-line max-h-[560px] overflow-y-auto pr-1">
                {filteredEmployees.map((emp) => {
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
                            {emp.isProbation && <Tag>Probation</Tag>}
                          </div>
                          <span className="text-[11.5px] text-muted truncate">
                            {emp.role} · {emp.location} · {emp.department}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <StatusPill status={emp.status} extraText={extraText} />
                        <ChevronRight size={14} className="text-muted/60 group-hover:text-accent transition-colors hidden sm:block" />
                      </div>
                    </div>
                  );
                })}

                {filteredEmployees.length === 0 && (
                  <div className="py-12 text-center text-muted italic text-[13px]">
                    No team members found matching your search.
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* 2. Team Life & Management Widget (grid-col-span-1) */}
          <div className="grid-col-span-1 flex flex-col gap-[var(--gap)]">
            <Card
              dataW="life"
              title="Team life & milestones"
              subtitle="Celebrations, onboarding, and probation reviews"
            >
              {/* Birthdays & Anniversaries */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-surface2/50 border border-line flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-accent text-[12px] font-semibold">
                    <Cake size={14} />
                    <span>Upcoming Birthdays</span>
                  </div>
                  {teamLife.birthdays.map((b, idx) => (
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
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-surface2/50 border border-line flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-accent2 text-[12px] font-semibold">
                    <Award size={14} />
                    <span>Work Anniversaries</span>
                  </div>
                  {teamLife.anniversaries.map((a, idx) => (
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
                  ))}
                </div>
              </div>

              {/* Attrition Risk Flag List */}
              <div className="flex flex-col gap-2 pt-2 border-t border-line/40">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
                  <ShieldAlert size={13} className="text-warn" />
                  Attrition Risk & Retention Flags
                </span>

                <div className="flex flex-col gap-2">
                  {teamLife.attritionRisks.map((risk, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-surface2/50 border border-line flex items-start gap-2.5"
                    >
                      <StatusPill status={risk.level === 'bad' ? 'behind' : 'at-risk'} />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[12.5px] font-bold text-ink">{risk.name}</span>
                        <span className="text-[11.5px] text-muted leading-snug">{risk.reason}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
