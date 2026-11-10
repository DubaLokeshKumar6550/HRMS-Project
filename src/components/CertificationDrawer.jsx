import React, { useState } from 'react';
import Drawer from './Drawer';
import FormField from './FormField';
import Textarea from './Textarea';
import { Award, Plus, FileText } from 'lucide-react';

export default function CertificationDrawer({
  isOpen,
  onClose,
  onAddCertification,
  viewingCertification = null,
}) {
  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [issuedDate, setIssuedDate] = useState('6 Nov 2026');
  const [expiryDate, setExpiryDate] = useState('6 Nov 2029');
  const [attachmentName, setAttachmentName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !issuer.trim()) return;

    onAddCertification({
      id: `CERT-${Date.now()}`,
      name,
      issuer,
      issuedDate,
      expiryDate,
      status: 'Verified',
      attachment: attachmentName || 'certificate_doc.pdf',
    });

    setName('');
    setIssuer('');
    setAttachmentName('');
    onClose();
  };

  // If viewing an existing certification in preview mode
  if (viewingCertification) {
    return (
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title={viewingCertification.name}
        subtitle={`Issued by ${viewingCertification.issuer}`}
        width="460px"
      >
        <div className="flex flex-col gap-4 text-[13px]">
          <div className="p-4 rounded-xl bg-surface2/60 border border-line flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface border border-line flex items-center justify-center text-accent">
                <Award size={20} />
              </div>
              <div>
                <h4 className="font-bold text-ink">{viewingCertification.issuer}</h4>
                <span className="text-[11px] text-muted font-mono">
                  Issued: {viewingCertification.issuedDate} · Expires: {viewingCertification.expiryDate}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#06141c] border border-line font-mono text-[12px] text-muted leading-relaxed">
            [ENCRYPTED ATTESTATION PREVIEW]
            <br />
            Credential Verification Hash: 0x9f4a8b23c109e
            <br />
            Attachment: {viewingCertification.attachment || 'verification.pdf'}
          </div>

          <div className="flex justify-end pt-3 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface2 text-ink border border-line font-semibold text-[12.5px]"
            >
              Close
            </button>
          </div>
        </div>
      </Drawer>
    );
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Add Professional Certification"
      subtitle="Upload or record technical credentials and licenses"
      width="480px"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-[13px]">
        <FormField label="Certification Name" id="cert-name" required>
          <input
            id="cert-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. AWS Solutions Architect Professional"
            className="w-full bg-surface2 text-ink text-[13px] px-3.5 py-2.5 rounded-xl border border-line focus:border-accent outline-none"
            required
          />
        </FormField>

        <FormField label="Issuing Authority / Organization" id="cert-issuer" required>
          <input
            id="cert-issuer"
            type="text"
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            placeholder="e.g. Amazon Web Services / CNCF"
            className="w-full bg-surface2 text-ink text-[13px] px-3.5 py-2.5 rounded-xl border border-line focus:border-accent outline-none"
            required
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Issue Date" id="cert-issue-date">
            <input
              id="cert-issue-date"
              type="text"
              value={issuedDate}
              onChange={(e) => setIssuedDate(e.target.value)}
              className="w-full bg-surface2 text-ink text-[12.5px] px-3.5 py-2 rounded-xl border border-line font-mono"
            />
          </FormField>

          <FormField label="Expiry Date" id="cert-expiry-date">
            <input
              id="cert-expiry-date"
              type="text"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full bg-surface2 text-ink text-[12.5px] px-3.5 py-2 rounded-xl border border-line font-mono"
            />
          </FormField>
        </div>

        <FormField label="Certificate File / Dossier Name" id="cert-file">
          <input
            id="cert-file"
            type="text"
            value={attachmentName}
            onChange={(e) => setAttachmentName(e.target.value)}
            placeholder="e.g. aws_cert_2026.pdf"
            className="w-full bg-surface2 text-ink text-[13px] px-3.5 py-2 rounded-xl border border-line font-mono text-[12px]"
          />
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
            disabled={!name.trim() || !issuer.trim()}
            className="px-4 py-2 rounded-xl bg-accent text-on-accent text-[12.5px] font-bold shadow-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Plus size={14} strokeWidth={2.4} />
            <span>Add certification</span>
          </button>
        </div>
      </form>
    </Drawer>
  );
}

