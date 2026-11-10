import React from 'react';
import { Download, FileSpreadsheet, Printer, X, Check } from 'lucide-react';
import { exportAttendanceCSV, exportPayrollInputsCSV, exportTeamRosterCSV } from '../utils/exportUtils';

export default function ExportModal({
  isOpen,
  onClose,
  employees,
  payrollCycle,
  onTriggerToast,
}) {
  if (!isOpen) return null;

  const handleExportAttendance = () => {
    exportAttendanceCSV(employees);
    onTriggerToast('Downloaded team-attendance-2026-11-06.csv');
    onClose();
  };

  const handleExportPayroll = () => {
    exportPayrollInputsCSV(employees, payrollCycle);
    onTriggerToast('Downloaded payroll-inputs-nov2026.csv');
    onClose();
  };

  const handleExportRoster = () => {
    exportTeamRosterCSV(employees);
    onTriggerToast('Downloaded team-roster-directory.csv');
    onClose();
  };

  const handlePrintPdf = () => {
    onClose();
    setTimeout(() => {
      window.print();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
        className="relative w-full max-w-md rounded-tpl bg-[#0a222b] border border-line p-5 shadow-2xl flex flex-col gap-4 text-ink animate-in fade-in zoom-in-95 duration-150"
        style={{ borderRadius: 'var(--radius)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-line/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center">
              <Download size={18} />
            </div>
            <div>
              <h3 id="export-modal-title" className="text-[16px] font-display font-bold text-ink leading-tight">
                Export Dashboard Reports
              </h3>
              <p className="text-[11.5px] text-muted">
                Download verified real-time CSV spreadsheets or print PDF
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-surface2 transition-colors border border-line/40 text-base"
          >
            ×
          </button>
        </div>

        {/* Export Options */}
        <div className="flex flex-col gap-2.5 text-[12.5px]">
          {/* Attendance CSV */}
          <button
            type="button"
            onClick={handleExportAttendance}
            className="p-3 rounded-xl bg-surface2/40 hover:bg-surface2 border border-line flex items-center justify-between transition-colors group text-left"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={20} className="text-good" />
              <div className="flex flex-col">
                <span className="font-bold text-ink group-hover:text-accent transition-colors">
                  Daily Attendance Log (CSV)
                </span>
                <span className="text-[11px] text-muted">
                  Includes punch in/out, working hours, mode (24 rows)
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
              Download .csv
            </span>
          </button>

          {/* Payroll CSV */}
          <button
            type="button"
            onClick={handleExportPayroll}
            className="p-3 rounded-xl bg-surface2/40 hover:bg-surface2 border border-line flex items-center justify-between transition-colors group text-left"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={20} className="text-accent" />
              <div className="flex flex-col">
                <span className="font-bold text-ink group-hover:text-accent transition-colors">
                  Monthly Payroll Inputs (CSV)
                </span>
                <span className="text-[11px] text-muted">
                  Paid days, LOP unpaid, approved overtime, claims
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
              Download .csv
            </span>
          </button>

          {/* Team Roster CSV */}
          <button
            type="button"
            onClick={handleExportRoster}
            className="p-3 rounded-xl bg-surface2/40 hover:bg-surface2 border border-line flex items-center justify-between transition-colors group text-left"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={20} className="text-accent2" />
              <div className="flex flex-col">
                <span className="font-bold text-ink group-hover:text-accent transition-colors">
                  Team Directory Roster (CSV)
                </span>
                <span className="text-[11px] text-muted">
                  Tenure, contact details, leave balances, 1:1 cadence
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
              Download .csv
            </span>
          </button>

          {/* PDF Print */}
          <button
            type="button"
            onClick={handlePrintPdf}
            className="p-3 rounded-xl bg-surface2/40 hover:bg-surface2 border border-line flex items-center justify-between transition-colors group text-left"
          >
            <div className="flex items-center gap-3">
              <Printer size={20} className="text-info" />
              <div className="flex flex-col">
                <span className="font-bold text-ink group-hover:text-accent transition-colors">
                  Print Dashboard / Save as PDF
                </span>
                <span className="text-[11px] text-muted">
                  Generates clean high-resolution printable report
                </span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-info bg-info/10 px-2 py-0.5 rounded border border-info/20">
              Print / PDF
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

