import React from 'react';
import Avatar from '../Avatar';
import Progress from '../Progress';
import Tag from '../Tag';
import {
  Layout,
  Server,
  Cloud,
  CheckCircle2,
  Palette,
  BarChart2,
  Users,
  ChevronRight,
  Clock,
  Target,
} from 'lucide-react';

const ICON_MAP = {
  Layout,
  Server,
  Cloud,
  CheckCircle2,
  Palette,
  BarChart2,
};

export default function TeamCard({ team, onSelectTeam, isSelected = false }) {
  const IconComponent = ICON_MAP[team.icon] || Users;
  const { stats, members } = team;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelectTeam(team)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectTeam(team);
        }
      }}
      className={`glass-card p-4 flex flex-col justify-between gap-3.5 transition-all text-left cursor-pointer group ${
        isSelected
          ? 'ring-2 ring-accent border-accent/60 bg-surface2/70 shadow-lg'
          : 'hover:border-accent/60 hover:bg-surface2/40 hover:shadow-md'
      }`}
    >
      {/* Header: Icon, Name, Dept & Arrow */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-line transition-colors group-hover:border-accent"
            style={{
              backgroundColor: 'var(--surface2)',
              color: 'var(--accent)',
            }}
          >
            <IconComponent size={18} strokeWidth={2} />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="font-display font-bold text-[14.5px] text-ink group-hover:text-accent transition-colors truncate">
              {team.name}
            </span>
            <span className="text-[11px] text-muted truncate">
              {team.department} · {team.location}
            </span>
          </div>
        </div>

        <div className="w-6 h-6 rounded-full bg-surface2/60 border border-line flex items-center justify-center shrink-0 text-muted group-hover:text-accent group-hover:border-accent transition-all group-hover:translate-x-0.5">
          <ChevronRight size={13} />
        </div>
      </div>

      {/* Description */}
      <p className="text-[12px] text-muted/90 line-clamp-2 leading-relaxed">
        {team.description}
      </p>

      {/* Team Lead Card */}
      <div className="flex items-center justify-between p-2 rounded-lg bg-surface2/40 border border-line/50 text-[11.5px]">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar name={team.leadName} size={24} />
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-muted uppercase tracking-wider font-mono">Team Lead</span>
            <span className="font-semibold text-ink truncate">{team.leadName}</span>
          </div>
        </div>
        <span className="text-[11px] text-muted font-mono">{stats.total} members</span>
      </div>

      {/* Avatar Stack + Presence Status */}
      <div className="flex items-center justify-between pt-1 border-t border-line/40 text-[11.5px]">
        {/* Avatar Stack */}
        <div className="flex items-center -space-x-2 overflow-hidden py-0.5">
          {members.slice(0, 4).map((m) => (
            <div key={m.id} className="ring-2 ring-[var(--surface)] rounded-full">
              <Avatar name={m.name} size={24} />
            </div>
          ))}
          {members.length > 4 && (
            <div className="w-6 h-6 rounded-full bg-surface2 border border-line flex items-center justify-center text-[10px] font-mono font-bold text-muted ring-2 ring-[var(--surface)]">
              +{members.length - 4}
            </div>
          )}
        </div>

        {/* Presence Tag */}
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-good shrink-0" />
          <span className="text-ink font-semibold">
            {stats.activeCount} / {stats.total} Active
          </span>
          {stats.onLeave > 0 && (
            <span className="text-warn">({stats.onLeave} leave)</span>
          )}
        </div>
      </div>

      {/* Sprint / Goals Progress */}
      <div className="flex flex-col gap-1 pt-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted flex items-center gap-1">
            <Target size={11} className="text-accent" />
            <span>Q3 Goals Progress</span>
          </span>
          <span className="font-mono font-bold text-ink">{stats.avgGoals}%</span>
        </div>
        <Progress value={stats.avgGoals} max={100} height={5} />
      </div>

      {/* Click prompt */}
      <div className="text-[11px] font-semibold text-accent group-hover:underline flex items-center justify-end gap-1 pt-0.5">
        <span>View team details</span>
        <ChevronRight size={12} />
      </div>
    </div>
  );
}

