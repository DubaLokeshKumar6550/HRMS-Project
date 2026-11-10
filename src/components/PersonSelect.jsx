import React from 'react';
import Avatar from './Avatar';

export default function PersonSelect({
  employees = [],
  selectedPerson = 'all',
  onChange,
  showAllOption = true,
  allLabel = 'All team (24)',
  label,
  id = 'person-select',
  className = '',
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-[12px] font-semibold text-muted select-none">
          {label}
        </label>
      )}

      <div className="relative inline-flex items-center">
        {selectedPerson !== 'all' ? (
          <div className="absolute left-2.5 pointer-events-none z-10 flex items-center">
            <Avatar
              name={
                employees.find((e) => e.id === selectedPerson || e.name === selectedPerson)?.name ||
                'User'
              }
              size={20}
            />
          </div>
        ) : (
          <div className="absolute left-2.5 pointer-events-none z-10 flex items-center text-muted">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
        )}

        <select
          id={id}
          value={selectedPerson}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Filter by person"
          className="appearance-none bg-surface2 text-ink text-[12.5px] font-semibold pl-8 pr-7 py-1.5 rounded-xl border border-line hover:border-line/80 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none cursor-pointer transition-all"
          style={{ colorScheme: 'dark' }}
        >
          {showAllOption && (
            <option value="all" className="bg-[#0a222b] text-ink font-medium">
              {allLabel}
            </option>
          )}
          {employees.map((emp) => (
            <option
              key={emp.id}
              value={emp.id}
              className="bg-[#0a222b] text-ink font-medium"
            >
              {emp.name} ({emp.role?.split(' ')[0] || 'Eng'})
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute right-2 flex items-center text-muted">
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </div>
  );
}

