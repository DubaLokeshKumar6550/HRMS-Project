import React from 'react';
import Drawer from './Drawer';
import { Command } from 'lucide-react';

const SHORTCUTS = [
  { group: 'Navigation', shortcuts: [
    { key: 'g + o', desc: 'Go to Overview' },
    { key: 'g + a', desc: 'Go to Attendance' },
    { key: 'g + l', desc: 'Go to Leave Requests' },
    { key: 'g + p', desc: 'Go to Performance' },
    { key: 'g + s', desc: 'Go to Shifts' },
    { key: 'g + t', desc: 'Go to Tasks' },
    { key: 'g + m', desc: 'Go to Meetings' },
    { key: 'g + r', desc: 'Go to Reports' },
  ]},
  { group: 'Actions', shortcuts: [
    { key: 'Shift + N', desc: 'Toggle Notifications Drawer' },
    { key: 'Cmd / Ctrl + K', desc: 'Focus Global Search' },
    { key: 'Esc', desc: 'Close any open drawer, modal or menu' },
    { key: '?', desc: 'Show this keyboard shortcuts guide' },
  ]},
];

export default function KeyboardShortcutsDrawer({ isOpen, onClose }) {
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      subtitle="Speed up your daily managerial workflows"
      width="440px"
    >
      <div className="flex flex-col gap-5 text-[13px]">
        {SHORTCUTS.map((section) => (
          <div key={section.group} className="flex flex-col gap-2.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted font-mono">
              {section.group}
            </h4>
            <div className="divide-y divide-line/30 rounded-xl border border-line bg-surface2/30 overflow-hidden">
              {section.shortcuts.map((sc) => (
                <div key={sc.key} className="p-3 flex items-center justify-between text-[12px]">
                  <span className="text-ink">{sc.desc}</span>
                  <kbd className="px-2 py-1 rounded-lg bg-surface border border-line text-accent font-mono text-[11px] shadow-sm">
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-2 text-[11px] text-muted text-center font-mono">
          Shortcuts are active across all manager desk modules
        </div>
      </div>
    </Drawer>
  );
}

