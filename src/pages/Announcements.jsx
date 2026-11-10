import React, { useState } from 'react';
import Card from '../components/Card';
import Drawer from '../components/Drawer';
import FormField from '../components/FormField';
import Select from '../components/Select';
import Textarea from '../components/Textarea';
import Tag from '../components/Tag';
import Avatar from '../components/Avatar';
import StatusPill from '../components/StatusPill';
import ReadReceipt from '../components/ReadReceipt';
import { initialAnnouncements } from '../data/announcements';
import {
  Megaphone,
  Pin,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Trash2,
  Send,
  Bold,
  Italic,
  List,
  Bell,
  Archive,
  Edit2,
  AlertTriangle,
} from 'lucide-react';

export default function Announcements({ employees = [], onTriggerToast }) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [activeTab, setActiveTab] = useState('Published'); // 'Published', 'Scheduled', 'Drafts', 'Archived'

  // Composer Card state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('My team');
  const [priority, setPriority] = useState('Important'); // 'Normal', 'Important'
  const [isPinned, setIsPinned] = useState(true);
  const [scheduleTime, setScheduleTime] = useState('Now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('15 Nov 2026');
  const [ackRequired, setAckRequired] = useState(true);

  // Detail Drawer state
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const notify = (msg, undoFn) => {
    if (onTriggerToast) onTriggerToast(msg, undoFn);
  };

  // Publish announcement
  const handlePublish = (asDraft = false) => {
    if (!title.trim()) return;

    const newAnn = {
      id: `ANN-${Date.now()}`,
      title,
      message,
      audience,
      priority,
      isPinned,
      status: asDraft ? 'Drafts' : scheduleTime === 'Now' ? 'Published' : 'Scheduled',
      publishedDate: scheduleTime === 'Now' ? '6 Nov 2026' : `Scheduled for ${scheduledDate}`,
      expiryDate: expiryDate || null,
      ackRequired,
      totalAudience: 24,
      readCount: asDraft ? 0 : 1,
      ackCount: asDraft ? 0 : 1,
      readBy: asDraft
        ? []
        : [
            {
              id: 'MGR-01',
              name: 'Lokesh Kumar',
              avatar: 'LK',
              readAt: 'Just now',
              acknowledged: true,
            },
          ],
      unreadBy: employees.filter((e) => e.name !== 'Lokesh Kumar'),
    };

    const prev = [...announcements];
    setAnnouncements([newAnn, ...announcements]);

    // Reset composer
    setTitle('');
    setMessage('');

    notify(
      asDraft
        ? 'Announcement saved as draft'
        : `Published announcement: "${newAnn.title}" to ${audience}`,
      () => setAnnouncements(prev)
    );
  };

  // Toggle Pin
  const handleTogglePin = (id) => {
    const prev = [...announcements];
    setAnnouncements(
      announcements.map((a) => (a.id === id ? { ...a, isPinned: !a.isPinned } : a))
    );
    notify('Updated pin status', () => setAnnouncements(prev));
  };

  // Archive announcement
  const handleArchive = (id) => {
    const prev = [...announcements];
    setAnnouncements(
      announcements.map((a) => (a.id === id ? { ...a, status: 'Archived' } : a))
    );
    notify('Archived announcement', () => setAnnouncements(prev));
  };

  // Delete announcement
  const handleDelete = (id) => {
    const prev = [...announcements];
    const target = announcements.find((a) => a.id === id);
    setAnnouncements(announcements.filter((a) => a.id !== id));
    notify(`Deleted: "${target?.title}"`, () => setAnnouncements(prev));
  };

  // Remind unread
  const handleRemindUnread = (ann) => {
    notify(`Slack & email reminder dispatched to unread team members for: "${ann.title}"`);
  };

  const filteredAnnouncements = announcements.filter((a) => a.status === activeTab);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Subtitle Strip */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-[12.5px] text-muted">
          Team-wide broadcasts, release freezes, holiday notices and acknowledgment tracking
        </p>
      </div>

      {/* Grid: 2 equal columns, widgets announce-new and announce-list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Widget: announce-new (spans 2) - Composer Card */}
        <Card
          id="announce-new"
          title="Compose Team Broadcast"
          className="col-span-1 md:col-span-2"
        >
          <div className="flex flex-col gap-4">
            <FormField label="Broadcast Title" id="ann-title" required>
              <input
                id="ann-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Diwali Holiday Schedule & Release Freeze 14–16 Nov 2026"
                className="w-full bg-surface2 text-ink text-[13px] px-3.5 py-2 rounded-xl border border-line focus:border-accent outline-none"
              />
            </FormField>

            {/* Rich text light toolbar & Textarea */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[12.5px] font-semibold text-ink">
                  Broadcast Message
                </label>
                <div className="flex items-center gap-1 bg-surface2 px-1.5 py-0.5 rounded-lg border border-line text-muted">
                  <button
                    type="button"
                    onClick={() => setMessage((prev) => `${prev} **bold text**`)}
                    className="p-1 rounded hover:text-ink hover:bg-surface"
                    title="Bold"
                  >
                    <Bold size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessage((prev) => `${prev} *italic text*`)}
                    className="p-1 rounded hover:text-ink hover:bg-surface"
                    title="Italic"
                  >
                    <Italic size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessage((prev) => `${prev}\n• Bullet item`)}
                    className="p-1 rounded hover:text-ink hover:bg-surface"
                    title="Bullet list"
                  >
                    <List size={13} />
                  </button>
                </div>
              </div>

              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write message details for the engineering team..."
                rows={3}
              />
            </div>

            {/* Config Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField label="Audience" id="ann-aud">
                <Select
                  id="ann-aud"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  options={['My team', 'Direct reports only', 'Selected people']}
                />
              </FormField>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12.5px] font-semibold text-ink">Priority</label>
                <div className="flex items-center gap-1.5">
                  {['Normal', 'Important'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
                        priority === p
                          ? p === 'Important'
                            ? 'bg-warn text-[#06141c] border-warn font-bold'
                            : 'bg-accent text-on-accent border-accent font-bold'
                          : 'bg-surface2 text-muted border-line hover:text-ink'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12.5px] font-semibold text-ink">Schedule</label>
                <div className="flex items-center gap-1.5">
                  {['Now', 'Pick date'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setScheduleTime(s)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all ${
                        scheduleTime === s
                          ? 'bg-surface text-ink border-accent font-bold'
                          : 'bg-surface2 text-muted border-line hover:text-ink'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="flex items-center justify-between flex-wrap gap-4 pt-2 border-t border-line/40 text-[12px]">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded bg-surface2 border-line text-accent w-3.5 h-3.5"
                  />
                  <span className="text-ink font-medium">Pin to top of team feeds</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={ackRequired}
                    onChange={(e) => setAckRequired(e.target.checked)}
                    className="rounded bg-surface2 border-line text-accent w-3.5 h-3.5"
                  />
                  <span className="text-ink font-medium">Require formal acknowledgment</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => notify('Previewing announcement modal')}
                  className="px-3 py-1.5 rounded-xl bg-surface2 text-muted hover:text-ink border border-line text-[12px] font-semibold"
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => handlePublish(true)}
                  className="px-3 py-1.5 rounded-xl bg-surface2 text-muted hover:text-ink border border-line text-[12px] font-semibold"
                >
                  Save draft
                </button>
                <button
                  type="button"
                  onClick={() => handlePublish(false)}
                  className="px-4 py-1.5 rounded-xl bg-accent text-on-accent text-[12px] font-bold shadow-sm hover:opacity-90 flex items-center gap-1.5"
                >
                  <Send size={13} strokeWidth={2.2} />
                  <span>Publish</span>
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Widget: announce-list (spans 2) */}
        <Card
          id="announce-list"
          title="Team Broadcast Directory"
          className="col-span-1 md:col-span-2"
          action={
            <div className="flex items-center gap-1 bg-surface2 rounded-lg p-0.5 border border-line text-[11px] font-semibold">
              {['Published', 'Scheduled', 'Drafts', 'Archived'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    activeTab === t ? 'bg-accent text-on-accent' : 'text-muted'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          }
        >
          <div className="flex flex-col gap-3">
            {filteredAnnouncements.length === 0 ? (
              <div className="py-8 text-center text-muted text-[13px]">
                No {activeTab.toLowerCase()} announcements found.
              </div>
            ) : (
              filteredAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  onClick={() => setSelectedAnnouncement(ann)}
                  className="p-4 rounded-xl bg-surface2/40 border border-line hover:border-line/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-surface2 border border-line flex items-center justify-center text-accent shrink-0">
                      <Megaphone size={16} />
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {ann.isPinned && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-accent bg-accent/15 px-2 py-0.5 rounded-full border border-accent/30">
                            <Pin size={11} className="rotate-45" />
                            Pinned
                          </span>
                        )}
                        <h4 className="font-bold text-[13.5px] text-ink truncate">
                          {ann.title}
                        </h4>
                        <Tag variant="default">{ann.audience}</Tag>
                        {ann.priority === 'Important' && (
                          <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-warn/20 text-warn border border-warn/40">
                            Important
                          </span>
                        )}
                      </div>

                      <p className="text-[12px] text-muted line-clamp-1 mt-1">
                        {ann.message}
                      </p>

                      <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-muted">
                        <span>{ann.publishedDate}</span>
                        {ann.expiryDate && <span>Expires: {ann.expiryDate}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Read Receipt Progress Bar & Actions */}
                  <div
                    className="flex items-center gap-4 shrink-0 self-end md:self-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ReadReceipt
                      readCount={ann.readCount}
                      totalCount={ann.totalAudience}
                      ackCount={ann.ackCount}
                      showAck={ann.ackRequired}
                      onClick={() => setSelectedAnnouncement(ann)}
                    />

                    {/* Row Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleTogglePin(ann.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          ann.isPinned
                            ? 'bg-accent/20 border-accent/40 text-accent'
                            : 'bg-surface2 border-line text-muted hover:text-ink'
                        }`}
                        title={ann.isPinned ? 'Unpin' : 'Pin announcement'}
                      >
                        <Pin size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleArchive(ann.id)}
                        className="p-1.5 rounded-lg bg-surface2 border border-line text-muted hover:text-ink transition-colors"
                        title="Archive"
                      >
                        <Archive size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(ann.id)}
                        className="p-1.5 rounded-lg bg-surface2 border border-line text-muted hover:text-bad transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Announcement Detail & Reader Tracking Drawer */}
      <Drawer
        isOpen={Boolean(selectedAnnouncement)}
        onClose={() => setSelectedAnnouncement(null)}
        title={selectedAnnouncement?.title || 'Announcement Details'}
        width="540px"
      >
        {selectedAnnouncement && (
          <div className="flex flex-col gap-5 text-[13px]">
            <div className="p-4 rounded-xl bg-surface2/60 border border-line flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag variant="default">{selectedAnnouncement.audience}</Tag>
                {selectedAnnouncement.priority === 'Important' && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-warn/20 text-warn border border-warn/40">
                    Important
                  </span>
                )}
                <span className="text-[11.5px] font-mono text-muted">
                  Published: {selectedAnnouncement.publishedDate}
                </span>
              </div>
              <p className="text-ink leading-relaxed mt-2 whitespace-pre-line">
                {selectedAnnouncement.message}
              </p>
            </div>

            {/* Read & Acknowledgment Statistics */}
            <div className="p-3.5 rounded-xl bg-surface border border-line flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-muted uppercase">Read Receipts</span>
                <div className="font-display font-extrabold text-[18px] text-ink">
                  {selectedAnnouncement.readCount} of {selectedAnnouncement.totalAudience}{' '}
                  <span className="text-[13px] text-accent font-mono font-normal">
                    ({Math.round((selectedAnnouncement.readCount / selectedAnnouncement.totalAudience) * 100)}%)
                  </span>
                </div>
              </div>

              {selectedAnnouncement.unreadBy?.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleRemindUnread(selectedAnnouncement)}
                  className="px-3 py-1.5 rounded-xl bg-accent text-on-accent text-[12px] font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Bell size={13} />
                  <span>Remind {selectedAnnouncement.unreadBy.length} unread</span>
                </button>
              )}
            </div>

            {/* Readers Breakdown */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted font-mono">
                Team Member Status
              </span>

              {/* Unread Members */}
              {selectedAnnouncement.unreadBy?.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold text-warn flex items-center gap-1">
                    <Clock size={12} />
                    Pending Read ({selectedAnnouncement.unreadBy.length})
                  </span>
                  <div className="divide-y divide-line/30 rounded-xl border border-line bg-surface/30">
                    {selectedAnnouncement.unreadBy.map((emp) => (
                      <div key={emp.id} className="p-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar name={emp.name} size={22} />
                          <span className="text-ink font-medium">{emp.name}</span>
                        </div>
                        <span className="text-[11px] font-mono text-muted">Unopened</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Read Members */}
              {selectedAnnouncement.readBy?.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-2">
                  <span className="text-[11px] font-bold text-good flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Read & Acknowledged ({selectedAnnouncement.readBy.length})
                  </span>
                  <div className="divide-y divide-line/30 rounded-xl border border-line bg-surface/30">
                    {selectedAnnouncement.readBy.map((emp) => (
                      <div key={emp.id} className="p-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar name={emp.name} size={22} />
                          <span className="text-ink font-medium">{emp.name}</span>
                        </div>
                        <span className="text-[11px] font-mono text-muted">
                          Read {emp.readAt}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

