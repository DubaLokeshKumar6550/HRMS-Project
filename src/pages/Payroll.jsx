import React, { useState } from 'react';
import Card from '../components/Card';
import SegBar from '../components/SegBar';
import Checklist from '../components/Checklist';
import Table from '../components/Table';
import Tag from '../components/Tag';
import Avatar from '../components/Avatar';
import { AlertCircle, AlertTriangle, CheckCircle, Info, Lock, Send } from 'lucide-react';

export default function Payroll({
  payrollCycle,
  employees,
  onToggleChecklist,
  onSubmitToHr,
  onSelectEmployee,
  onResolveUan,
  onViewPtSlabs,
}) {
  const [currentStep, setCurrentStep] = useState('Draft');

  const steps = ['Draft', 'Reviewed', 'Approved', 'Locked'];

  const allChecklistDone = payrollCycle.checklist.every((c) => c.done);

  // Segments for payroll breakdown matching Screenshot 1
  const salarySegments = [
    { label: 'Basic', value: payrollCycle.split.basic, color: 'var(--accent)' },
    { label: 'HRA', value: payrollCycle.split.hra, color: '#38bdf8' },
    { label: 'Special allowance', value: payrollCycle.split.specialAllowance, color: '#9b8cff' },
    { label: 'Variable', value: payrollCycle.split.variable, color: '#fbbf24' },
  ];

  // Table columns for non-monetary inputs (strictly no individual salaries!)
  const columns = [
    {
      header: 'Employee',
      key: 'name',
      sticky: true,
      render: (row) => (
        <div className="flex items-center gap-2.5 min-w-[180px]">
          <Avatar name={row.name} size={30} />
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-ink truncate">{row.name}</span>
            <span className="text-[11px] text-muted truncate">
              {row.role} · {row.state}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Paid Days',
      key: 'paidDays',
      align: 'center',
      render: (row) => (
        <span className="font-mono font-bold text-ink tabular-nums">
          {row.paidDays} / 30
        </span>
      ),
    },
    {
      header: 'LOP Days',
      key: 'lopDays',
      align: 'center',
      render: (row) => (
        <span
          className={`font-mono font-bold tabular-nums ${
            row.lopDays > 0 ? 'text-bad' : 'text-muted'
          }`}
        >
          {row.lopDays}
        </span>
      ),
    },
    {
      header: 'Overtime',
      key: 'overtimeHours',
      align: 'center',
      render: (row) => (
        <span
          className={`font-mono tabular-nums ${
            row.overtimeHours > 15 ? 'text-warn font-bold' : 'text-ink'
          }`}
        >
          {row.overtimeHours}h
        </span>
      ),
    },
    {
      header: 'Claims Pending',
      key: 'claims',
      align: 'center',
      render: (row) => (
        <span className="font-mono text-muted tabular-nums">
          {row.reimbursementsPending}
        </span>
      ),
    },
    {
      header: 'Flags & Audit Notes',
      key: 'flags',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.flags && row.flags.length > 0 ? (
            row.flags.map((flag, fIdx) => (
              <span
                key={fIdx}
                className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface2 border border-line text-muted flex items-center gap-1"
              >
                {flag}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-good flex items-center gap-1">
              <CheckCircle size={11} /> Verified
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="standard-grid-2col w-full">
      {/* 1. Payroll Cycle & Input Verification Card (grid-col-span-1) */}
      <div className="grid-col-span-1">
        <Card
          dataW="payin"
          title="Payroll inputs · Nov"
          subtitle={`Cut-off ${payrollCycle.cutoffDate}`}
        >
          {/* Status Stepper / Segmented Control */}
          <div className="flex rounded-full p-1 bg-surface2/80 border border-line select-none">
            {steps.map((st) => {
              const isActive = currentStep === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setCurrentStep(st)}
                  className={`flex-1 py-1.5 rounded-full text-[12px] font-semibold transition-all text-center ${
                    isActive
                      ? 'shadow-md font-bold'
                      : 'text-muted hover:text-ink'
                  }`}
                  style={{
                    backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                    color: isActive ? 'var(--on-accent)' : 'var(--muted)',
                  }}
                >
                  {st}
                </button>
              );
            })}
          </div>

          {/* Team Gross Aggregate */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-muted font-mono">
                TEAM GROSS, MONTHLY · {payrollCycle.teamGrossMonthly}
              </span>
              <span className="text-[11px] text-muted">
                (Aggregated across {employees.length} team members)
              </span>
            </div>

            <SegBar segments={salarySegments} height={14} showLegend={true} />
          </div>

          {/* Key verification rows */}
          <div className="flex flex-col divide-y divide-dashed divide-line text-[13px] pt-1">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-muted">Unpaid leave (LOP) days</span>
              <span className="font-mono font-bold text-ink">0</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-muted">Mid-month joiner</span>
              <span className="font-mono text-ink font-semibold">
                Arjun Das · 15 of 30 days
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-muted">Overtime to confirm</span>
              <span className="font-mono text-warn font-bold">7.5 h</span>
            </div>
          </div>

          {/* Pre-submission Checklist */}
          <div className="pt-2 border-t border-line/40 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                Pre-submission checklist
              </span>
              <span className="text-[11px] font-mono text-muted">
                {payrollCycle.checklist.filter((c) => c.done).length} / {payrollCycle.checklist.length} Complete
              </span>
            </div>

            <Checklist
              items={payrollCycle.checklist}
              onToggle={onToggleChecklist}
            />

            <button
              type="button"
              disabled={!allChecklistDone}
              onClick={onSubmitToHr}
              className={`w-full py-2.5 px-4 rounded-tpl font-display font-bold text-[13px] flex items-center justify-center gap-2 mt-2 transition-all ${
                allChecklistDone
                  ? 'hover:brightness-110 active:scale-95 shadow-md'
                  : 'opacity-40 cursor-not-allowed bg-surface2 text-muted border border-line'
              }`}
              style={{
                backgroundColor: allChecklistDone ? 'var(--accent)' : undefined,
                color: allChecklistDone ? 'var(--on-accent)' : undefined,
                borderRadius: 'var(--radius)',
              }}
            >
              <Send size={14} />
              <span>Submit inputs to HR</span>
            </button>
          </div>
        </Card>
      </div>

      {/* 2. India Statutory Compliance & Aggregate Card (grid-col-span-1) */}
      <div className="grid-col-span-1 flex flex-col gap-[var(--gap)]">
        {/* India Compliance card */}
        <Card
          title="India compliance"
          subtitle="To be validated by payroll & legal team"
        >
          <div className="flex flex-col gap-3">
            {/* Warning Alert: UAN missing */}
            <div className="p-3.5 rounded-xl bg-warn/10 border border-warn/30 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-warn shrink-0 mt-0.5" size={17} />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-bold text-ink">
                    UAN missing for 1 new joiner
                  </span>
                  <p className="text-[12px] text-muted leading-relaxed">
                    Arjun Das needs UAN before the first PF contribution cycle to prevent EPFO compliance hold.
                  </p>
                </div>
              </div>
              {onResolveUan && (
                <button
                  type="button"
                  onClick={onResolveUan}
                  className="px-2.5 py-1 rounded bg-warn text-black text-[11px] font-bold hover:brightness-110 active:scale-95 transition-all shrink-0 mt-0.5"
                >
                  Resolve UAN
                </button>
              )}
            </div>

            {/* Info Alert: Professional Tax */}
            <div className="p-3.5 rounded-xl bg-info/10 border border-info/30 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Info className="text-info shrink-0 mt-0.5" size={17} />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-bold text-ink">
                    Professional tax applies in 2 states
                  </span>
                  <p className="text-[12px] text-muted leading-relaxed">
                    Karnataka (Bengaluru hub) and Telangana (Hyderabad hub) state slabs calculated automatically.
                  </p>
                </div>
              </div>
              {onViewPtSlabs && (
                <button
                  type="button"
                  onClick={onViewPtSlabs}
                  className="px-2.5 py-1 rounded bg-info/20 hover:bg-info/30 border border-info/40 text-info text-[11px] font-bold active:scale-95 transition-all shrink-0 mt-0.5"
                >
                  View Slabs
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Team Totals Aggregate Card */}
        <Card
          title="Team totals (Aggregate)"
          subtitle="Manager visibility restricted to team sums only"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-surface2/60 border border-line">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted block">
                Total Team CTC / Month
              </span>
              <span className="text-[22px] font-display font-bold text-ink mt-1 block">
                {payrollCycle.teamCostTotal}
              </span>
              <span className="text-[11px] text-muted mt-0.5 block">
                Budget: ₹40.00 L · 96% utilized
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface2/60 border border-line">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted block">
                Estimated Overtime Payout
              </span>
              <span className="text-[22px] font-display font-bold text-accent mt-1 block">
                {payrollCycle.overtimeCost}
              </span>
              <span className="text-[11px] text-muted mt-0.5 block">
                39.5 hours total across team
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface2/30 border border-line/40 text-[11.5px] text-muted font-body leading-relaxed mt-1">
            <strong className="text-ink font-semibold">Statutory notice:</strong> Individual salaries are hidden from engineering managers. PF, ESI, PT, TDS are configurable examples, to be validated by HR operations.
          </div>
        </Card>
      </div>

      {/* 3. Non-monetary Inputs Table (grid-col-span-2) */}
      <div className="grid-col-span-2">
        <Card
          dataW="payteam"
          title="Per-employee payroll inputs (Non-monetary)"
          subtitle="Verify payable days, unexcused absences, and approved overtime"
        >
          <Table
            columns={columns}
            data={employees}
            onRowClick={onSelectEmployee}
          />
        </Card>
      </div>
    </div>
  );
}

