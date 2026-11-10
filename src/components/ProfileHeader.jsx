import React from 'react';
import Tag from './Tag';
import StatusPill from './StatusPill';
import { Camera, Shield, Users, Calendar, UserCheck } from 'lucide-react';

export default function ProfileHeader({
  profile,
  onOpenPhotoUploader,
  className = '',
}) {
  const completeness = profile.profileCompleteness || 86;

  return (
    <div
      data-w="phead"
      className={`glass-card p-5 md:p-6 rounded-2xl flex flex-col gap-5 border border-line bg-surface/50 ${className}`}
      style={{
        borderRadius: 'var(--radius)',
        backdropFilter: 'var(--blur)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      {/* Upper Profile Identity */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          {/* 88px Avatar Circle with camera button */}
          <div className="relative shrink-0">
            {profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={profile.name}
                className="w-[88px] h-[88px] rounded-full object-cover ring-2 ring-accent shadow-lg"
              />
            ) : (
              <div
                className="w-[88px] h-[88px] rounded-full flex items-center justify-center font-display font-bold text-[32px] text-white shadow-lg ring-2 ring-line select-none"
                style={{ backgroundColor: 'hsl(190, 52%, 40%)' }}
              >
                {profile.avatar || profile.name?.slice(0, 2).toUpperCase()}
              </div>
            )}

            <button
              type="button"
              onClick={onOpenPhotoUploader}
              aria-label="Change profile photo"
              title="Change profile photo"
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-accent text-on-accent border-2 border-[#06141c] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md"
            >
              <Camera size={13} strokeWidth={2.2} />
            </button>
          </div>

          {/* Name & Details */}
          <div className="flex flex-col min-w-0">
            <h2
              className="font-display font-extrabold text-ink tracking-tight leading-tight truncate"
              style={{ fontSize: 'clamp(26px, 3.2vw, 40px)' }}
            >
              {profile.name}
            </h2>

            <p className="text-[14px] text-muted font-medium mt-0.5 truncate">
              {profile.designation} · {profile.department}
            </p>

            {/* Badges / Tags row */}
            <div className="flex items-center gap-2 flex-wrap mt-2.5">
              <span
                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow-sm font-mono tracking-wide"
                style={{ backgroundColor: 'var(--accent2)' }}
              >
                MANAGER
              </span>
              <Tag variant="default">{profile.employeeId}</Tag>
              <Tag variant="default">{profile.workLocation}</Tag>
              <StatusPill status="good" label="Active" />
            </div>
          </div>
        </div>

        {/* Profile Completeness progress widget */}
        <div className="w-full md:w-64 p-3.5 rounded-xl bg-surface2/40 border border-line flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between text-[12px]">
            <span className="font-semibold text-ink">Profile completeness</span>
            <span className="font-mono font-bold text-accent">{completeness}%</span>
          </div>

          <div className="w-full h-2 rounded-full bg-surface2 overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>

          {profile.missingItems?.length > 0 && (
            <span className="text-[11px] text-muted truncate">
              Suggested: {profile.missingItems[0]}
            </span>
          )}
        </div>
      </div>

      {/* Row of small stat tiles (KPI tile style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-line/40">
        <div className="p-3 rounded-xl bg-surface2/30 border border-line flex flex-col">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted font-mono">
            Tenure
          </span>
          <span className="font-display font-extrabold text-[18px] text-ink mt-0.5">
            {profile.tenure}
          </span>
          <span className="text-[10.5px] text-muted">Since {profile.joinedDate}</span>
        </div>

        <div className="p-3 rounded-xl bg-surface2/30 border border-line flex flex-col">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted font-mono">
            Total Team Size
          </span>
          <span className="font-display font-extrabold text-[18px] text-ink mt-0.5">
            {profile.teamSize} Engineers
          </span>
          <span className="text-[10.5px] text-muted">{profile.directReports} Direct · {profile.indirectReports} Indirect</span>
        </div>

        <div className="p-3 rounded-xl bg-surface2/30 border border-line flex flex-col">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted font-mono">
            Direct Reports
          </span>
          <span className="font-display font-extrabold text-[18px] text-accent mt-0.5">
            {profile.directReports}
          </span>
          <span className="text-[10.5px] text-muted">Core engineering pod</span>
        </div>

        <div className="p-3 rounded-xl bg-surface2/30 border border-line flex flex-col">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted font-mono">
            Reports To
          </span>
          <span className="font-display font-bold text-[15px] text-ink truncate mt-0.5">
            {profile.reportingTo?.name || 'Rahul Menon'}
          </span>
          <span className="text-[10.5px] text-muted truncate">{profile.reportingTo?.role || 'Director, Engineering'}</span>
        </div>
      </div>
    </div>
  );
}

