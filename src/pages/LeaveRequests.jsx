import React, { useState } from 'react';
import Card from '../components/Card';
import Tabs from '../components/Tabs';
import Calendar from '../components/Calendar';
import Tag from '../components/Tag';
import Avatar from '../components/Avatar';
import { Check, X, AlertTriangle, Calendar as CalendarIcon, Info } from 'lucide-react';

export default function LeaveRequests({
  pendingLeaves = [],
  approvedLeaves = [],
  rejectedLeaves = [],
  onApproveLeave,
  onRejectLeave,
  calendarDays,
  onSelectEmployee,
  employees,
}) {
  const [queueTab, setQueueTab] = useState('pending');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const queueTabs = [
    { id: 'pending', label: 'Pending', count: pendingLeaves.length },
    { id: 'approved', label: 'Approved', count: approvedLeaves.length },
    { id: 'rejected', label: 'Rejected', count: rejectedLeaves.length },
  ];

  const handleStartReject = (reqId) => {
    setRejectingId(reqId);
    setRejectionReason('');
  };

  const handleConfirmReject = (req) => {
    onRejectLeave({ ...req, customReason: rejectionReason || 'Operational constraints' });
    setRejectingId(null);
    setRejectionReason('');
  };

  return (
    <div className="standard-grid-2col w-full">
      {/* 1. Leave Requests Queue Widget (grid-col-span-1) */}
      <div className="grid-col-span-1">
        <Card
          dataW="leaveq"
          title="Leave requests queue"
          subtitle="Manage vacation, casual, and sick leave submissions"
          headerAction={
            <Tabs
              tabs={queueTabs}
              activeId={queueTab}
              onChange={setQueueTab}
              size="sm"
            />
          }
        >
          <div className="flex flex-col divide-y divide-dashed divide-line">
            {/* PENDING LIST */}
            {queueTab === 'pending' &&
              pendingLeaves.map((req) => (
                <div
                  key={req.id}
                  className="py-3 flex flex-col gap-2.5 group hover:bg-surface2/30 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar name={req.name} size={32} customBg={req.avatarBg} />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-[14px] text-ink hover:text-accent transition-colors">
                          {req.name}
                        </span>
                        <span className="text-[11px] text-muted truncate">
                          {req.role}
                        </span>
                      </div>
                    </div>
                    <Tag>{req.type || 'Leave'}</Tag>
                  </div>

                  {/* Leave details & overlap warning */}
                  <div className="flex flex-col gap-1 text-[12px] bg-surface2/40 p-2.5 rounded-lg border border-line/40">
                    <div className="flex items-center justify-between">
                      <span className="text-ink font-semibold">{req.dates}</span>
                      <strong className="text-ink font-bold font-mono">{req.days}</strong>
                    </div>

                    <span className="text-muted text-[11.5px]">{req.subDetails}</span>

                    {req.overlapWarning && (
                      <div className="flex items-center gap-1.5 text-warn font-semibold text-[11px] mt-1 pt-1 border-t border-warn/20">
                        <AlertTriangle size={13} />
                        <span>Team overlap: 2+ engineers requested off on 12 Nov</span>
                      </div>
                    )}

                    <div className="text-muted/90 italic text-[11.5px] mt-0.5">
                      "{req.reason}"
                    </div>
                  </div>

                  {/* Rejection reason inline prompt */}
                  {rejectingId === req.id ? (
                    <div className="flex flex-col gap-2 p-2 rounded-lg bg-surface2 border border-bad/40">
                      <label className="text-[11px] text-muted font-medium">
                        Rejection reason (optional for team member):
                      </label>
                      <input
                        type="text"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="e.g., Sprint release window coverage needed"
                        className="bg-bg border border-line rounded px-2.5 py-1 text-[12px] text-ink focus:outline-none focus:border-bad"
                      />
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setRejectingId(null)}
                          className="px-2.5 py-1 text-[11px] text-muted hover:text-ink"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmReject(req)}
                          className="px-3 py-1 rounded bg-bad text-black text-[11px] font-bold"
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => onApproveLeave(req)}
                        aria-label={`Approve leave for ${req.name}`}
                        className="py-1.5 px-3 rounded-tpl text-[12px] font-bold flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all shadow-sm"
                        style={{
                          backgroundColor: 'var(--accent)',
                          color: 'var(--on-accent)',
                          borderRadius: 'var(--radius)',
                        }}
                      >
                        <Check size={14} strokeWidth={2.5} />
                        <span>Approve Leave</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartReject(req.id)}
                        aria-label={`Reject leave for ${req.name}`}
                        className="py-1.5 px-3 rounded-tpl text-[12px] font-semibold bg-surface2 border border-line hover:border-bad/60 hover:text-bad text-muted flex items-center gap-1.5 transition-all active:scale-95"
                        style={{ borderRadius: 'var(--radius)' }}
                      >
                        <X size={14} />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}

            {/* APPROVED LIST */}
            {queueTab === 'approved' &&
              approvedLeaves.map((req) => (
                <div key={req.id} className="py-3 flex items-center justify-between px-2">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={req.name} size={30} />
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-ink">{req.name}</span>
                      <span className="text-[11.5px] text-muted">
                        {req.dates} · {req.days}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-accent font-semibold flex items-center gap-1">
                    <Check size={13} />
                    Approved
                  </span>
                </div>
              ))}

            {/* REJECTED LIST */}
            {queueTab === 'rejected' &&
              rejectedLeaves.map((req) => (
                <div key={req.id} className="py-3 flex items-center justify-between px-2">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={req.name} size={30} />
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-ink">{req.name}</span>
                      <span className="text-[11.5px] text-muted">
                        {req.dates} · Reason: {req.reason}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-bad font-semibold flex items-center gap-1">
                    <X size={13} />
                    Rejected
                  </span>
                </div>
              ))}

            {/* Empty states */}
            {queueTab === 'pending' && pendingLeaves.length === 0 && (
              <div className="py-10 text-center text-muted italic text-[13px]">
                All caught up! No pending leave requests.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 2. Leave Calendar Widget (grid-col-span-1) */}
      <div className="grid-col-span-1">
        <Card
          dataW="leavecal"
          title="November 2026 team schedule"
          subtitle="Real-time visibility into planned leaves and statutory holidays"
        >
          <Calendar days={calendarDays} selectedDay={6} />

          {/* All leave this month summary */}
          <div className="flex flex-col gap-2 pt-3 border-t border-line/40">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
              All approved leaves this month (3 people)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg bg-surface2/60 border border-line/50">
                <span className="text-[12.5px] font-bold text-ink block">Rahul Verma</span>
                <span className="text-[11px] text-accent2">4–6 Nov (3 days)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface2/60 border border-line/50">
                <span className="text-[12.5px] font-bold text-ink block">Divya Menon</span>
                <span className="text-[11px] text-accent2">5–6 Nov (2 days)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface2/60 border border-line/50">
                <span className="text-[12.5px] font-bold text-ink block">Sunita Rao</span>
                <span className="text-[11px] text-accent2">6 Nov (1 day)</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

