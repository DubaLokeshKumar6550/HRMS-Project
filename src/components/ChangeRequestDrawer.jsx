import React, { useState } from 'react';
import Drawer from './Drawer';
import FormField from './FormField';
import Select from './Select';
import Textarea from './Textarea';
import { Send, UploadCloud } from 'lucide-react';

const WORK_FIELDS = [
  'Work location',
  'Designation',
  'Department',
  'Business unit',
  'Employment type',
  'Shift schedule',
  'Cost centre code',
  'Notice period',
];

export default function ChangeRequestDrawer({
  isOpen,
  onClose,
  onSubmitRequest,
}) {
  const [field, setField] = useState(WORK_FIELDS[0]);
  const [newValue, setNewValue] = useState('');
  const [reason, setReason] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newValue.trim() || !reason.trim()) return;

    onSubmitRequest({
      field,
      requestedValue: newValue,
      reason,
      attachment: attachmentName || null,
      status: 'Pending',
      date: '6 Nov 2026',
    });

    // Reset & close
    setNewValue('');
    setReason('');
    setAttachmentName('');
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Request HR Information Change"
      subtitle="HR-managed employment records change request"
      width="480px"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-[13px]">
        <p className="text-[12px] text-muted leading-relaxed">
          Statutory and organizational records require verification by HR Operations before updating your profile.
        </p>

        <FormField label="Field to Change" id="cr-field" required>
          <Select
            id="cr-field"
            value={field}
            onChange={(e) => setField(e.target.value)}
            options={WORK_FIELDS}
          />
        </FormField>

        <FormField label="Requested New Value" id="cr-new-val" required>
          <input
            id="cr-new-val"
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="e.g. Bengaluru HQ / Lead Engineering Manager"
            className="w-full bg-surface2 text-ink text-[13px] px-3.5 py-2.5 rounded-xl border border-line focus:border-accent outline-none"
            required
          />
        </FormField>

        <FormField label="Business Justification / Reason" id="cr-reason" required>
          <Textarea
            id="cr-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain reason for change request, transfer order details, or managerial justification..."
            rows={3}
            required
          />
        </FormField>

        <FormField label="Supporting Document (Optional attachment name)" id="cr-attach">
          <div className="flex items-center gap-2">
            <input
              id="cr-attach"
              type="text"
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
              placeholder="e.g. transfer_letter_approval.pdf"
              className="w-full bg-surface2 text-ink text-[13px] px-3.5 py-2 rounded-xl border border-line focus:border-accent outline-none font-mono text-[12px]"
            />
          </div>
        </FormField>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-line mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface2 text-muted hover:text-ink border border-line text-[12.5px] font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!newValue.trim() || !reason.trim()}
            className="px-4 py-2 rounded-xl bg-accent text-on-accent text-[12.5px] font-bold shadow-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Send size={13} strokeWidth={2.2} />
            <span>Send request to HR</span>
          </button>
        </div>
      </form>
    </Drawer>
  );
}

