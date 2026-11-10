import React from 'react';
import Switch from './Switch';
import { Lock } from 'lucide-react';

export default function PreferenceMatrix({
  matrix = {},
  onChange,
  className = '',
}) {
  const handleToggle = (category, channel, val) => {
    if (matrix[category]?.lockedInApp && channel === 'inApp') return;
    const updated = {
      ...matrix,
      [category]: {
        ...matrix[category],
        [channel]: val,
      },
    };
    onChange(updated);
  };

  const categories = Object.keys(matrix);

  return (
    <div className={`overflow-x-auto w-full rounded-xl border border-line bg-surface/30 ${className}`}>
      <table className="w-full border-collapse text-left min-w-[540px] text-[12.5px]">
        <thead>
          <tr className="border-b border-line bg-surface2/50 text-[11px] font-bold uppercase tracking-wider text-muted font-mono">
            <th className="py-2.5 px-4">Notification Category</th>
            <th className="py-2.5 px-4 text-center w-28">In-App</th>
            <th className="py-2.5 px-4 text-center w-28">Email</th>
            <th className="py-2.5 px-4 text-center w-28">SMS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line/30">
          {categories.map((cat) => {
            const row = matrix[cat] || {};
            const isApprovalsLocked = row.lockedInApp;

            return (
              <tr key={cat} className="hover:bg-surface2/30 transition-colors">
                <td className="py-3 px-4 font-semibold text-ink">
                  {cat}
                </td>

                {/* In-app switch */}
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    {isApprovalsLocked ? (
                      <div
                        className="flex items-center gap-1 text-muted text-[11px] select-none"
                        title="Mandatory for managerial compliance"
                      >
                        <Switch checked={true} disabled={true} aria-label={`${cat} in-app notifications (locked)`} />
                        <Lock size={12} className="text-muted/70" />
                      </div>
                    ) : (
                      <Switch
                        checked={row.inApp}
                        onChange={(val) => handleToggle(cat, 'inApp', val)}
                        aria-label={`${cat} in-app notifications`}
                      />
                    )}
                  </div>
                </td>

                {/* Email switch */}
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center">
                    <Switch
                      checked={row.email}
                      onChange={(val) => handleToggle(cat, 'email', val)}
                      aria-label={`${cat} email notifications`}
                    />
                  </div>
                </td>

                {/* SMS switch */}
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center">
                    <Switch
                      checked={row.sms}
                      onChange={(val) => handleToggle(cat, 'sms', val)}
                      aria-label={`${cat} SMS notifications`}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

