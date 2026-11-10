import React from 'react';
import {
  Shield,
  Bell,
  Sliders,
  CheckCircle,
  Calendar,
  Eye,
} from 'lucide-react';

export const SETTINGS_SECTIONS = [
  { id: 'security', label: 'Security & Login', icon: Shield },
  { id: 'notif', label: 'Notifications Matrix', icon: Bell },
  { id: 'prefs', label: 'System Preferences', icon: Sliders },
  { id: 'approve', label: 'Approvals & Delegation', icon: CheckCircle },
  { id: 'integr', label: 'Calendar & Integrations', icon: Calendar },
  { id: 'privacy', label: 'Privacy & Data', icon: Eye },
];

export default function SettingsMenu({
  activeSection = 'security',
  onSelectSection,
  className = '',
}) {
  return (
    <div
      role="tablist"
      aria-label="Settings categories"
      className={`flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 shrink-0 w-full lg:w-[220px] ${className}`}
    >
      {SETTINGS_SECTIONS.map((sec) => {
        const Icon = sec.icon;
        const isActive = activeSection === sec.id;

        return (
          <button
            key={sec.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onSelectSection(sec.id)}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 select-none text-left shrink-0 border ${
              isActive
                ? 'bg-surface2 text-ink border-line shadow-sm'
                : 'bg-surface/30 text-muted border-transparent hover:text-ink hover:bg-surface2/60'
            }`}
          >
            <Icon
              size={15}
              strokeWidth={1.8}
              className={`shrink-0 ${isActive ? 'text-accent' : 'text-muted'}`}
            />
            <span className="truncate flex-1">{sec.label}</span>
          </button>
        );
      })}
    </div>
  );
}

