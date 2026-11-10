import React from 'react';
import Card from '../Card.jsx';
import { HelpCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { attendanceRules } from '../../config/attendanceRules.js';

export default function PolicyCard({ onTriggerToast }) {
  const policyRulesList = [
    { label: 'Standard Shift Window', value: `${attendanceRules.shift.name} (${attendanceRules.shift.startTime} – ${attendanceRules.shift.endTime} IST · 9h span)` },
    { label: 'Grace Period', value: `${attendanceRules.gracePeriodMin} minutes (Check-in up to ${attendanceRules.lateCutoffTime} is On time)` },
    { label: 'Late Arrival Policy', value: `After ${attendanceRules.lateCutoffTime}; counts as 1 late mark (3 free per month)` },
    { label: 'Late Mark Consequence', value: 'Informational warn flag on 4th+ mark; HR review threshold' },
    { label: 'Mandatory Lunch Break', value: `${attendanceRules.mandatoryBreakMin} min auto-deducted if person records no breaks` },
    { label: 'Daily Break Allowance', value: `Up to ${attendanceRules.allowedBreakTotalMin} min total (lunch + tea + personal breaks)` },
    { label: 'Minimum Logged Break', value: `${attendanceRules.minBreakRecordMin} min (breaks under 5 min are merged into work time)` },
    { label: 'Full Day Net Hours', value: `≥ ${attendanceRules.fullDayMinHours}h net working time required` },
    { label: 'Short Hours / Half Day', value: `≥ ${attendanceRules.shortHoursMinHours}h and < ${attendanceRules.fullDayMinHours}h (counts as half-day if unregularised)` },
    { label: 'Early Departure Cutoff', value: `Before ${attendanceRules.earlyDepartureCutoffTime} (shift end minus 15 min grace)` },
    { label: 'Overtime Threshold', value: `Net working hours above ${attendanceRules.overtimeThresholdHours}h (counts towards comp-off inputs)` },
    { label: 'Regularisation Limit', value: `Within ${attendanceRules.regularisationWindowDays} days of date; max ${attendanceRules.maxRegularisationsPerMonth} requests/month` },
    { label: 'Office Geo Radius', value: `${attendanceRules.officeGeoRadiusMeters} meters around office coordinates (sample geo-fence)` },
    { label: 'Weekly Off Days', value: 'Saturday and Sunday (punches count as Extra Day / Comp-off)' },
  ];

  return (
    <Card
      id="mypolicy"
      title="Attendance & Punctuality Policy"
      subtitle="Corporate governance & shift guidelines"
      className="col-span-1 md:col-span-2"
      headerAction={
        <button
          type="button"
          onClick={() => onTriggerToast?.('Policy clarification request dispatched to HR Operations.')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface2 text-muted hover:text-ink text-[12px] font-semibold transition-colors border border-line"
        >
          <HelpCircle size={13} className="text-accent" />
          <span>Request a policy clarification</span>
        </button>
      }
    >
      <div className="flex flex-col gap-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5 text-[12.5px] p-2">
          {policyRulesList.map((rule, idx) => (
            <div key={idx} className="flex flex-col gap-0.5 border-b border-line/40 pb-2">
              <span className="text-[11.5px] font-semibold text-muted">
                {rule.label}
              </span>
              <span className="font-mono text-ink text-[12.5px]">
                {rule.value}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-[11.5px] text-muted pt-2 border-t border-line/60">
          <span className="italic">
            Configurable example, to be validated by HR before production compliance lock.
          </span>
          <span className="font-mono">Policy Ref: POL-ENG-ATT-v2.6</span>
        </div>
      </div>
    </Card>
  );
}

