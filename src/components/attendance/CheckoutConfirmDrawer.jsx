import React, { useState } from 'react';
import Drawer from '../Drawer.jsx';
import { AlertTriangle, LogOut, Clock } from 'lucide-react';

export default function CheckoutConfirmDrawer({
  isOpen,
  onClose,
  earlyMin = 0,
  isImmediateCheckout = false,
  onConfirmCheckout,
}) {
  const [earlyReason, setEarlyReason] = useState('');

  const handleConfirm = () => {
    onConfirmCheckout(earlyReason);
    setEarlyReason('');
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Early Check-out"
      width="400px"
    >
      <div className="flex flex-col gap-4 text-[13px]">
        <div className="p-3.5 rounded-xl bg-warn/15 border border-warn/30 text-warn text-[12px] flex items-start gap-2.5">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>
            {isImmediateCheckout
              ? 'You checked in less than 5 minutes ago. Are you sure you want to check out now?'
              : `Checking out now will be recorded as an Early Departure by ${earlyMin} minutes. This may require regularisation if net working hours fall below 8 hours.`}
          </span>
        </div>

        {!isImmediateCheckout && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="earlyReason" className="text-[12px] font-semibold text-ink">
              Reason for early departure (optional)
            </label>
            <textarea
              id="earlyReason"
              rows={2}
              value={earlyReason}
              onChange={(e) => setEarlyReason(e.target.value)}
              placeholder="e.g., Doctor appointment / client on-site visit..."
              className="w-full bg-surface2 border border-line rounded-xl p-3 text-[12.5px] text-ink focus:outline-none focus:border-accent"
            />
          </div>
        )}

        <div className="flex items-center gap-2 p-2 rounded-lg bg-surface2/40 border border-line/60 text-[11px] text-muted font-mono">
          <Clock size={12} className="text-accent shrink-0" />
          <span>Departure GPS location and geofence stamp will be verified upon submit.</span>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-line">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface2 text-muted hover:text-ink text-[12.5px] font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 rounded-xl bg-warn text-black font-display font-bold text-[12.5px] shadow-sm hover:brightness-105"
          >
            Confirm check out
          </button>
        </div>
      </div>
    </Drawer>
  );
}

