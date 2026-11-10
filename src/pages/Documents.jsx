import React, { useState } from 'react';
import Card from '../components/Card';
import Drawer from '../components/Drawer';
import Tag from '../components/Tag';
import Avatar from '../components/Avatar';
import StatusPill from '../components/StatusPill';
import PersonSelect from '../components/PersonSelect';
import {
  documentCategories,
  initialDocuments,
  expiringSoonDocuments,
  myAccessRequests,
} from '../data/documents';
import {
  FileText,
  Lock,
  Eye,
  Download,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Send,
  Check,
  X,
  FileCheck2,
} from 'lucide-react';

export default function Documents({ employees = [], onTriggerToast }) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [accessRequests, setAccessRequests] = useState(myAccessRequests);
  const [selectedPerson, setSelectedPerson] = useState('all');
  const [activeCategory, setActiveCategory] = useState('All');

  // Preview Drawer state
  const [previewDoc, setPreviewDoc] = useState(null);

  // Request Access Modal / State
  const [requestTargetDoc, setRequestTargetDoc] = useState(null);
  const [requestReason, setRequestReason] = useState('');

  const notify = (msg, undoFn) => {
    if (onTriggerToast) onTriggerToast(msg, undoFn);
  };

  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    if (selectedPerson !== 'all' && doc.employeeId !== selectedPerson) return false;
    if (activeCategory !== 'All' && doc.category !== activeCategory) return false;
    return true;
  });

  // Request access from HR
  const handleRequestAccessSubmit = () => {
    if (!requestTargetDoc) return;
    const newReq = {
      id: `REQ-DOC-${Date.now()}`,
      documentName: requestTargetDoc.name,
      category: requestTargetDoc.category,
      requestedDate: '6 Nov 2026',
      reason: requestReason || 'Manager audit verification',
      approver: 'HR Operations',
      status: 'Pending',
      expiresInDays: null,
    };

    const prev = [...accessRequests];
    setAccessRequests([newReq, ...accessRequests]);
    setRequestTargetDoc(null);
    setRequestReason('');

    notify(
      `Access request submitted to HR for "${newReq.documentName}"`,
      () => setAccessRequests(prev)
    );
  };

  // Remind employee of expiring document
  const handleRemindExpiring = (doc) => {
    notify(
      `Automated renewal reminder dispatched to ${doc.employeeName} for ${doc.name}`
    );
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Controls Strip with Subtitle and Person Select */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-[12.5px] text-muted">
          Role certifications, compliance dossiers, employee files, and permissioned audit access
        </p>

        <div className="ml-auto">
          <PersonSelect
            employees={employees}
            selectedPerson={selectedPerson}
            onChange={setSelectedPerson}
            label="Filter team:"
          />
        </div>
      </div>

      {/* Security & Audit Info Box */}
      <div className="p-3.5 rounded-2xl border border-dashed border-line bg-surface/30 flex items-center justify-between gap-3 text-[12px] text-muted">
        <div className="flex items-center gap-2.5">
          <ShieldCheck size={18} className="text-accent shrink-0" />
          <span>
            Documents are visible only with explicit role permission. Every view, preview, and access request is encrypted and audit logged for compliance.
          </span>
        </div>
        <span className="font-mono text-[11px] text-accent font-semibold shrink-0">
          ISO 27001 · SOC-2 Type II
        </span>
      </div>

      {/* Grid: 2 equal columns, widgets docs and docreq */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Widget: docs (spans 2) */}
        <Card
          id="docs"
          title="Team Compliance & Employment Documents"
          className="col-span-1 md:col-span-2"
          action={
            <span className="text-[11px] font-mono text-muted">
              {filteredDocuments.length} documents indexed
            </span>
          }
        >
          <div className="flex flex-col gap-4">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-line/40">
              {documentCategories.map((cat) => {
                const isSelected = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-all select-none whitespace-nowrap border ${
                      isSelected
                        ? 'bg-accent text-on-accent border-accent shadow-sm'
                        : 'bg-surface2 text-muted border-line hover:text-ink hover:border-line/80'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Document Table */}
            <div className="overflow-x-auto w-full rounded-xl border border-line bg-surface/30">
              <table className="w-full border-collapse text-left min-w-[720px] text-[12.5px]">
                <thead>
                  <tr className="border-b border-line bg-surface2/50 text-[11px] font-bold uppercase tracking-wider text-muted font-mono">
                    <th className="py-2.5 px-3">Document Name</th>
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Uploaded</th>
                    <th className="py-2.5 px-3">Expiry Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Access Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/30">
                  {filteredDocuments.map((doc) => {
                    const isExpiringSoon = doc.expiryDate && doc.expiryDate.includes('2026');

                    return (
                      <tr key={doc.id} className="hover:bg-surface2/40 transition-colors">
                        <td className="py-3 px-3 font-semibold text-ink flex items-center gap-2">
                          <FileText size={15} className="text-muted shrink-0" />
                          <span>{doc.name}</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <Avatar name={doc.employeeName} size={22} />
                            <span className="text-ink font-medium">{doc.employeeName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <Tag variant="default">{doc.category}</Tag>
                        </td>
                        <td className="py-3 px-3 font-mono text-muted text-[11.5px]">
                          {doc.uploadedDate}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11.5px]">
                          {doc.expiryDate ? (
                            <span className={isExpiringSoon ? 'text-warn font-bold' : 'text-muted'}>
                              {doc.expiryDate}
                            </span>
                          ) : (
                            <span className="text-muted/60">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <StatusPill
                            status={doc.status === 'Verified' ? 'good' : 'warn'}
                            label={doc.status}
                          />
                        </td>
                        <td className="py-3 px-3 text-right">
                          {doc.access === 'Allowed' ? (
                            <button
                              type="button"
                              onClick={() => setPreviewDoc(doc)}
                              className="px-3 py-1 rounded-xl bg-surface2 text-accent hover:bg-surface border border-line text-[11.5px] font-semibold flex items-center gap-1.5 ml-auto transition-colors"
                            >
                              <Eye size={13} />
                              <span>View preview</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setRequestTargetDoc(doc)}
                              className="px-3 py-1 rounded-xl bg-surface2 text-muted hover:text-ink border border-line text-[11.5px] font-semibold flex items-center gap-1.5 ml-auto transition-colors"
                            >
                              <Lock size={12} className="text-warn" />
                              <span>Request access</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Expiring Soon Card (span 1) */}
        <Card
          id="expiring-soon"
          title="Expiring Soon (30 Days)"
          className="col-span-1"
          action={
            <span className="text-[11px] font-mono text-warn font-bold">
              {expiringSoonDocuments.length} requiring renewal
            </span>
          }
        >
          <div className="flex flex-col gap-3">
            {expiringSoonDocuments.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-surface2/40 border border-warn/40 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="font-bold text-[13px] text-ink leading-snug">
                      {item.name}
                    </span>
                    <span className="text-[11.5px] text-muted mt-0.5">
                      Holder: <strong className="text-ink">{item.employeeName}</strong>
                    </span>
                  </div>
                  <Tag variant="warn">{item.category}</Tag>
                </div>

                <div className="flex items-center justify-between text-[11.5px] pt-1 border-t border-line/30">
                  <span className="text-warn font-mono font-bold flex items-center gap-1">
                    <Clock size={12} />
                    Expires in {item.daysRemaining} days ({item.expiryDate})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemindExpiring(item)}
                    className="text-accent text-[11.5px] font-bold hover:underline"
                  >
                    Remind employee
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Widget: docreq (span 1) - My Access Requests */}
        <Card
          id="docreq"
          title="My Document Access Requests"
          className="col-span-1"
          action={
            <span className="text-[11px] font-mono text-muted">
              {accessRequests.length} recorded
            </span>
          }
        >
          <div className="flex flex-col gap-3">
            {accessRequests.map((req) => (
              <div
                key={req.id}
                className="p-3 rounded-xl bg-surface2/30 border border-line flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[13px] text-ink truncate">
                    {req.documentName}
                  </span>
                  <StatusPill
                    status={
                      req.status === 'Approved'
                        ? 'good'
                        : req.status === 'Pending'
                        ? 'warn'
                        : 'bad'
                    }
                    label={req.status}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted">
                  <span>Requested: {req.requestedDate}</span>
                  <span>Approver: {req.approver}</span>
                </div>

                {req.status === 'Approved' && req.expiresInDays !== null && (
                  <div className="text-[11px] font-mono text-good font-semibold">
                    Access active · Expires in {req.expiresInDays} days
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Document Preview Drawer */}
      <Drawer
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        title={previewDoc?.name || 'Document Preview'}
        width="560px"
      >
        {previewDoc && (
          <div className="flex flex-col gap-4 text-[13px]">
            <div className="p-3.5 rounded-xl bg-surface2 border border-line flex items-center justify-between">
              <div>
                <span className="text-[11px] text-muted uppercase font-mono">Employee</span>
                <div className="font-bold text-[14px] text-ink">{previewDoc.employeeName}</div>
              </div>
              <div>
                <span className="text-[11px] text-muted uppercase font-mono">File Details</span>
                <div className="font-mono text-[12px] text-accent">
                  {previewDoc.fileType} · {previewDoc.size}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#06141c] border border-line min-h-[220px] font-mono text-[12px] text-ink/90 whitespace-pre-wrap leading-relaxed">
              {previewDoc.previewContent || 'Preview rendered in encrypted viewer.'}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-line text-[11.5px] text-muted">
              <span>View logged for compliance audit trail</span>
              <button
                type="button"
                onClick={() => notify(`Downloaded document: ${previewDoc.name}`)}
                className="px-3.5 py-1.5 rounded-xl bg-surface2 text-ink hover:bg-surface border border-line text-[12px] font-semibold flex items-center gap-1.5"
              >
                <Download size={13} />
                <span>Download file</span>
              </button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Request Access Drawer / Form */}
      <Drawer
        isOpen={Boolean(requestTargetDoc)}
        onClose={() => setRequestTargetDoc(null)}
        title="Request Document Access from HR"
        width="460px"
      >
        {requestTargetDoc && (
          <div className="flex flex-col gap-4">
            <div className="p-3.5 rounded-xl bg-surface2 border border-line flex items-start gap-2.5">
              <Lock size={16} className="text-warn mt-0.5 shrink-0" />
              <div>
                <h4 className="font-bold text-[13.5px] text-ink">
                  {requestTargetDoc.name}
                </h4>
                <p className="text-[11.5px] text-muted mt-0.5">
                  Category: {requestTargetDoc.category} · Employee: {requestTargetDoc.employeeName}
                </p>
              </div>
            </div>

            <p className="text-[12px] text-muted leading-relaxed">
              Restricted documents (identification cards, bank records, personal filings) require explicit HR compliance approval. Approved access is valid for 7 days.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-semibold text-ink">
                Business Justification Reason
              </label>
              <textarea
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                placeholder="State the audit, legal, or management reason for accessing this file..."
                rows={3}
                className="w-full bg-surface2 text-ink text-[12.5px] px-3.5 py-2.5 rounded-xl border border-line focus:border-accent outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line mt-2">
              <button
                type="button"
                onClick={() => setRequestTargetDoc(null)}
                className="px-3.5 py-2 rounded-xl bg-surface2 text-muted border border-line text-[12.5px] font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestAccessSubmit}
                className="px-4 py-2 rounded-xl bg-accent text-on-accent text-[12.5px] font-bold shadow-sm hover:opacity-90"
              >
                Submit Request to HR
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

