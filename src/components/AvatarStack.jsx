import React from 'react';
import Avatar from './Avatar';

export default function AvatarStack({
  attendees = [],
  max = 4,
  size = 26,
  className = '',
}) {
  if (!attendees || attendees.length === 0) return null;

  const visible = attendees.slice(0, max);
  const remaining = attendees.length - max;

  return (
    <div className={`flex items-center -space-x-2 shrink-0 ${className}`}>
      {visible.map((person, idx) => (
        <div
          key={person.id || person.name || idx}
          className="ring-2 ring-bg rounded-full relative z-10 transition-transform hover:z-20 hover:scale-105"
          title={`${person.name}${person.rsvp ? ` (${person.rsvp})` : ''}`}
        >
          <Avatar name={person.name} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className="flex items-center justify-center font-display font-bold text-[10.5px] text-ink bg-surface2 ring-2 ring-bg rounded-full shrink-0 select-none"
          style={{ width: `${size}px`, height: `${size}px` }}
          title={`${remaining} more`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

