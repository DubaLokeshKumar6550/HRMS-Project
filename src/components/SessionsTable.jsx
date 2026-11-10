import React, { useState } from 'react';
import StatusPill from './StatusPill';
import Drawer from './Drawer';
import { Laptop, Smartphone, Monitor, ShieldAlert, LogOut } from 'lucide-react';

export default function SessionsTable({
  sessions = [],
  onRevokeSession,
  onRevokeAllOtherSessions,
  className = '',
}) {
  const [confirmRevokeAll, setConfirmRevokeAll] = useState(false);

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'Mobile':
        return <Smartphone size={15} className="text-muted" />;
      case 'Laptop':
        return <Laptop size={15} className="text-muted" />;
      case 'Desktop':
      default:
        return <Monitor size={15} className="text-muted" />;
    }
  };

  return (
    <div className={`flex flex-col gap-3 w-full ${className}`}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-[12px] font-bold uppercase tracking-wider text-muted font-mono">
          Active Sign-in Sessions ({sessions.length})
        </span>

        {sessions.length > 1 && (
          <button
            type="button"
            onClick={() => setConfirmRevokeAll(true)}
            className="px-3 py-1.5 rounded-xl bg-surface2 text-muted hover:text-bad border border-line hover:border-bad/40 text-[12px] font-semibold transition-colors flex items-center gap-1.5"
          >
            <LogOut size={13} />
            <span>Sign out of all other devices</span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto w-full rounded-xl border border-line bg-surface/30">
        <table className="w-full border-collapse text-left min-w-[620px] text-[12.5px]">
          <thead>
            <tr className="border-b border-line bg-surface2/50 text-[11px] font-bold uppercase tracking-wider text-muted font-mono">
              <th className="py-2.5 px-3">Device & Browser</th>
              <th className="py-2.5 px-3">Location</th>
              <th className="py-2.5 px-3 font-mono">IP Address</th>
              <th className="py-2.5 px-3">Last Active</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/30">
            {sessions.map((sess) => (
              <tr key={sess.id} className="hover:bg-surface2/40 transition-colors">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2.5">
                    {getDeviceIcon(sess.deviceType)}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-ink">{sess.device}</span>
                        {sess.isCurrent && (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-good/20 text-good border border-good/40">
                            This device
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted">{sess.browser}</span>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-3 text-muted">{sess.location}</td>

                <td className="py-3 px-3 font-mono text-muted text-[11.5px]">
                  {sess.ip}
                </td>

                <td className="py-3 px-3 font-mono text-[11.5px] text-muted">
                  {sess.lastActive}
                </td>

                <td className="py-3 px-3 text-right">
                  {!sess.isCurrent && (
                    <button
                      type="button"
                      aria-label={`Sign out of ${sess.device}`}
                      onClick={() => onRevokeSession(sess.id)}
                      className="text-[11.5px] text-bad hover:underline font-semibold"
                    >
                      Sign out
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Drawer for Sign Out of all other devices */}
      <Drawer
        isOpen={confirmRevokeAll}
        onClose={() => setConfirmRevokeAll(false)}
        title="Sign Out Other Devices?"
        subtitle="Terminate all other active browser and mobile sessions"
        width="440px"
      >
        <div className="flex flex-col gap-4 text-[13px]">
          <div className="p-3.5 rounded-xl bg-warn/15 border border-warn/40 text-warn flex items-start gap-2.5 text-[12px]">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <span>
              This will immediately invalidate session tokens on all other logged-in browsers, laptops, and mobile phones. You will stay signed in on this current device.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-line mt-2">
            <button
              type="button"
              onClick={() => setConfirmRevokeAll(false)}
              className="px-4 py-2 rounded-xl bg-surface2 text-muted hover:text-ink border border-line text-[12.5px] font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onRevokeAllOtherSessions();
                setConfirmRevokeAll(false);
              }}
              className="px-4 py-2 rounded-xl bg-bad text-[#06141c] text-[12.5px] font-bold shadow-sm hover:brightness-110"
            >
              Confirm Sign Out All
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

