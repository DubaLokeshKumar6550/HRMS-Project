import React, { useState } from 'react';
import Card from '../components/Card';
import Drawer from '../components/Drawer';
import FormField from '../components/FormField';
import Select from '../components/Select';
import Textarea from '../components/Textarea';
import Tag from '../components/Tag';
import Avatar from '../components/Avatar';
import StatusPill from '../components/StatusPill';
import AvatarStack from '../components/AvatarStack';
import { initialMeetings, meetingTypes } from '../data/meetings';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  Plus,
  Check,
  X,
  AlertTriangle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ListTodo,
} from 'lucide-react';

export default function Meetings({ employees = [], onTriggerToast, onNavigate }) {
  const [meetings, setMeetings] = useState(initialMeetings);
  const [calView, setCalView] = useState('month'); // 'month' | 'week'
  const [selectedDay, setSelectedDay] = useState('2026-11-06');
  const [activeListTab, setActiveListTab] = useState('Upcoming'); // 'Upcoming' | 'Past' | 'Cancelled'

  // Schedule Meeting Drawer State
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    type: 'Team sync',
    date: '2026-11-06',
    startTime: '11:00 AM',
    endTime: '12:00 PM',
    attendeeIds: ['EMP-001', 'EMP-003', 'EMP-005'],
    location: 'Meeting Room 4B / Google Meet',
    link: 'https://meet.google.com/xyz-monsoon-eng',
    agenda: '',
    recurrence: 'None',
    reminder: '10 min before',
  });
  const [scheduleConflict, setScheduleConflict] = useState(null);

  // Meeting Detail Drawer State
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [meetingNotes, setMeetingNotes] = useState('');

  const notify = (msg, undoFn) => {
    if (onTriggerToast) onTriggerToast(msg, undoFn);
  };

  // Check attendee conflict
  const checkAttendeeConflict = (attendeeIds, date) => {
    // Check if Karthik or Sneha is on leave on this date
    if (attendeeIds.includes('EMP-007') && date === '2026-11-09') {
      return 'Karthik Iyer has approved Sick Leave on 9 Nov 2026.';
    }
    if (attendeeIds.includes('EMP-003') && date === '2026-11-10') {
      return 'Sneha Reddy has approved Casual Leave on 10 Nov 2026.';
    }
    return null;
  };

  // Submit Schedule Meeting
  const handleScheduleSubmit = () => {
    if (!scheduleForm.title.trim()) return;

    const conflict = checkAttendeeConflict(scheduleForm.attendeeIds, scheduleForm.date);
    if (conflict) {
      setScheduleConflict(conflict);
      return;
    }

    const attendeesList = scheduleForm.attendeeIds.map((id) => {
      const emp = employees.find((e) => e.id === id);
      return {
        id,
        name: emp?.name || 'Engineer',
        avatar: emp?.avatar || emp?.name?.slice(0, 2).toUpperCase() || 'EN',
        rsvp: 'Pending',
      };
    });

    const newMeeting = {
      id: `MEET-${Date.now()}`,
      title: scheduleForm.title,
      type: scheduleForm.type,
      date: scheduleForm.date,
      dateFormatted: '6 Nov 2026',
      startTime: scheduleForm.startTime,
      endTime: scheduleForm.endTime,
      location: scheduleForm.location,
      link: scheduleForm.link,
      agenda: scheduleForm.agenda,
      attendees: attendeesList,
      status: 'Upcoming',
      notes: '',
      actionItems: [],
      attachments: [],
    };

    const prev = [...meetings];
    setMeetings([newMeeting, ...meetings]);
    setIsScheduleOpen(false);
    setScheduleConflict(null);
    notify(`Scheduled: "${newMeeting.title}" with ${attendeesList.length} attendees`, () =>
      setMeetings(prev)
    );
  };

  // Cancel Meeting
  const handleCancelMeeting = (meetId) => {
    const prev = [...meetings];
    const target = meetings.find((m) => m.id === meetId);
    setMeetings(
      meetings.map((m) => (m.id === meetId ? { ...m, status: 'Cancelled' } : m))
    );
    notify(`Cancelled meeting: ${target?.title}`, () => setMeetings(prev));
  };

  // Filter meetings for selected day
  const dayMeetings = meetings.filter((m) => m.date === selectedDay);

  // Filter list tab
  const listMeetings = meetings.filter((m) => m.status === activeListTab);

  // 30 days of November 2026 (starts on Sunday, Nov 1)
  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2026-11-${dayNum < 10 ? '0' : ''}${dayNum}`;
    const dayMeetingsCount = meetings.filter((m) => m.date === dateStr).length;
    return {
      dayNum,
      dateStr,
      isToday: dateStr === '2026-11-06',
      meetingsCount: dayMeetingsCount,
    };
  });

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Controls Strip with Subtitle and Schedule Button */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-[12.5px] text-muted">
          Engineering sprint syncs, 1:1 check-ins, agenda action items and calendar
        </p>

        <button
          type="button"
          onClick={() => {
            setScheduleConflict(null);
            setIsScheduleOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent text-on-accent text-[12.5px] font-bold shadow-sm hover:opacity-90 ml-auto"
        >
          <Plus size={14} strokeWidth={2.4} />
          <span>Schedule meeting</span>
        </button>
      </div>

      {/* Grid: 2 equal columns, widgets meetcal and meetlist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Widget: meetcal (spans 2) */}
        <Card
          id="meetcal"
          title="Team Calendar (November 2026)"
          className="col-span-1 md:col-span-2"
          action={
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-surface2 rounded-xl border border-line p-0.5 text-[11.5px] font-semibold">
                <button
                  type="button"
                  onClick={() => setCalView('month')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    calView === 'month' ? 'bg-accent text-on-accent' : 'text-muted'
                  }`}
                >
                  Month
                </button>
                <button
                  type="button"
                  onClick={() => setCalView('week')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    calView === 'week' ? 'bg-accent text-on-accent' : 'text-muted'
                  }`}
                >
                  Week
                </button>
              </div>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            {/* 7-column calendar grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div
                  key={d}
                  className="py-1 text-[11px] font-bold uppercase tracking-wider text-muted font-mono"
                >
                  {d}
                </div>
              ))}

              {calendarDays.map((d) => {
                const isSelected = selectedDay === d.dateStr;

                return (
                  <button
                    key={d.dateStr}
                    type="button"
                    onClick={() => setSelectedDay(d.dateStr)}
                    className={`h-14 p-1 rounded-xl flex flex-col items-center justify-between transition-all select-none border ${
                      isSelected
                        ? 'border-accent ring-2 ring-accent/30 bg-surface2'
                        : d.isToday
                        ? 'border-accent bg-accent/10'
                        : 'border-line/40 bg-surface2/30 hover:border-line hover:bg-surface2/60'
                    }`}
                  >
                    <span
                      className={`text-[11.5px] font-mono leading-none ${
                        d.isToday ? 'text-accent font-bold' : 'text-ink'
                      }`}
                    >
                      {d.dayNum}
                    </span>

                    {/* Meeting dots */}
                    {d.meetingsCount > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {d.meetingsCount > 1 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-accent2" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected day info box with dashed border */}
            <div className="p-3.5 rounded-xl border border-dashed border-line bg-surface/40 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-bold text-ink">
                  Schedule for: <span className="text-accent font-mono">{selectedDay}</span>
                </span>
                <span className="text-muted font-mono">
                  {dayMeetings.length} meeting{dayMeetings.length !== 1 ? 's' : ''}
                </span>
              </div>

              {dayMeetings.length === 0 ? (
                <p className="text-[12px] text-muted italic">
                  No meetings scheduled on this day.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {dayMeetings.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMeeting(m)}
                      className="p-2.5 rounded-lg bg-surface2/60 border border-line hover:border-accent cursor-pointer transition-all flex items-center justify-between gap-3 text-[12px]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
                        <span className="font-semibold text-ink truncate">{m.title}</span>
                        <Tag variant="default">{m.type}</Tag>
                      </div>
                      <span className="font-mono text-muted shrink-0">{m.startTime} – {m.endTime}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Widget: meetlist (spans 2) */}
        <Card
          id="meetlist"
          title="Meeting Directory"
          className="col-span-1 md:col-span-2"
          action={
            <div className="flex items-center gap-1 bg-surface2 rounded-lg p-0.5 border border-line text-[11px] font-semibold">
              {['Upcoming', 'Past', 'Cancelled'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveListTab(t)}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    activeListTab === t ? 'bg-accent text-on-accent' : 'text-muted'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          }
        >
          <div className="flex flex-col gap-3">
            {listMeetings.length === 0 ? (
              <div className="py-8 text-center text-muted text-[13px]">
                No {activeListTab.toLowerCase()} meetings found.
              </div>
            ) : (
              listMeetings.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMeeting(m)}
                  className="p-4 rounded-xl bg-surface2/40 border border-line hover:border-line/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-surface2 border border-line flex items-center justify-center text-accent shrink-0">
                      <CalendarIcon size={16} />
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-[13.5px] text-ink truncate">
                          {m.title}
                        </h4>
                        <Tag variant="default">{m.type}</Tag>
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-[11.5px] text-muted">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock size={12} />
                          {m.dateFormatted} · {m.startTime} – {m.endTime}
                        </span>
                        <span className="flex items-center gap-1 truncate">
                          <MapPin size={12} />
                          {m.location}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-2">
                        <AvatarStack attendees={m.attendees} max={4} size={24} />
                        <span className="text-[11px] text-muted">
                          {m.attendees.filter((a) => a.rsvp === 'Accepted').length} Accepted ·{' '}
                          {m.attendees.filter((a) => a.rsvp === 'Pending').length} Pending
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="flex items-center gap-2 shrink-0 self-end md:self-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {m.link && (
                      <a
                        href={m.link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-accent text-on-accent text-[12px] font-bold flex items-center gap-1 shadow-sm hover:opacity-90"
                      >
                        <Video size={13} />
                        <span>Join</span>
                      </a>
                    )}

                    {m.status === 'Upcoming' && (
                      <>
                        <button
                          type="button"
                          onClick={() => notify(`Reschedule link sent for: ${m.title}`)}
                          className="px-2.5 py-1.5 rounded-xl bg-surface2 text-muted hover:text-ink border border-line text-[11.5px] font-semibold"
                        >
                          Reschedule
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCancelMeeting(m.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-surface2 text-muted hover:text-bad border border-line text-[11.5px] font-semibold"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Schedule Meeting Drawer */}
      <Drawer
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        title="Schedule Engineering Meeting"
        width="520px"
      >
        <div className="flex flex-col gap-4">
          {scheduleConflict && (
            <div className="p-3 rounded-xl bg-warn/15 border border-warn/50 flex items-start gap-2 text-warn text-[12px]">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Schedule Conflict Warning:</strong>
                <p className="mt-0.5">{scheduleConflict}</p>
              </div>
            </div>
          )}

          <FormField label="Meeting Title" id="meet-title" required>
            <input
              id="meet-title"
              type="text"
              value={scheduleForm.title}
              onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
              placeholder="e.g. Sprint 44 Architecture Sync"
              className="w-full bg-surface2 text-ink text-[13px] px-3.5 py-2 rounded-xl border border-line focus:border-accent outline-none"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Meeting Type" id="meet-type">
              <Select
                id="meet-type"
                value={scheduleForm.type}
                onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value })}
                options={meetingTypes}
              />
            </FormField>
            <FormField label="Recurrence" id="meet-rec">
              <Select
                id="meet-rec"
                value={scheduleForm.recurrence}
                onChange={(e) => setScheduleForm({ ...scheduleForm, recurrence: e.target.value })}
                options={['None', 'Weekly', 'Fortnightly', 'Monthly']}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="Date" id="meet-date">
              <input
                id="meet-date"
                type="text"
                value={scheduleForm.date}
                onChange={(e) => {
                  setScheduleForm({ ...scheduleForm, date: e.target.value });
                  setScheduleConflict(null);
                }}
                className="w-full bg-surface2 text-ink text-[12.5px] px-3 py-2 rounded-xl border border-line font-mono"
              />
            </FormField>
            <FormField label="Start Time (IST)" id="meet-start">
              <input
                id="meet-start"
                type="text"
                value={scheduleForm.startTime}
                onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                className="w-full bg-surface2 text-ink text-[12.5px] px-3 py-2 rounded-xl border border-line font-mono"
              />
            </FormField>
            <FormField label="End Time (IST)" id="meet-end">
              <input
                id="meet-end"
                type="text"
                value={scheduleForm.endTime}
                onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                className="w-full bg-surface2 text-ink text-[12.5px] px-3 py-2 rounded-xl border border-line font-mono"
              />
            </FormField>
          </div>

          <FormField label="Location or Video Link" id="meet-loc">
            <input
              id="meet-loc"
              type="text"
              value={scheduleForm.location}
              onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
              className="w-full bg-surface2 text-ink text-[13px] px-3.5 py-2 rounded-xl border border-line"
            />
          </FormField>

          <FormField label="Agenda & Goals" id="meet-agenda">
            <Textarea
              id="meet-agenda"
              value={scheduleForm.agenda}
              onChange={(e) => setScheduleForm({ ...scheduleForm, agenda: e.target.value })}
              placeholder="Outline objectives, review topics, and expected decisions..."
              rows={2}
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-line mt-2">
            <button
              type="button"
              onClick={() => setIsScheduleOpen(false)}
              className="px-3.5 py-2 rounded-xl bg-surface2 text-muted border border-line text-[12.5px] font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleScheduleSubmit}
              className="px-4 py-2 rounded-xl bg-accent text-on-accent text-[12.5px] font-bold shadow-sm hover:opacity-90"
            >
              Confirm Schedule
            </button>
          </div>
        </div>
      </Drawer>

      {/* Meeting Detail Drawer */}
      <Drawer
        isOpen={Boolean(selectedMeeting)}
        onClose={() => setSelectedMeeting(null)}
        title={selectedMeeting?.title || 'Meeting Details'}
        width="520px"
      >
        {selectedMeeting && (
          <div className="flex flex-col gap-4 text-[13px]">
            <div className="p-3.5 rounded-xl bg-surface2/60 border border-line flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Tag variant="default">{selectedMeeting.type}</Tag>
                <span className="font-mono text-accent font-bold">
                  {selectedMeeting.startTime} – {selectedMeeting.endTime}
                </span>
              </div>
              <p className="text-ink/90 leading-relaxed mt-1">
                {selectedMeeting.agenda || 'Regular team engineering sync.'}
              </p>
            </div>

            {/* Attendees with RSVP status */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted font-mono">
                Attendees & Responses ({selectedMeeting.attendees.length})
              </span>
              <div className="divide-y divide-line/30 rounded-xl border border-line bg-surface/30">
                {selectedMeeting.attendees.map((att) => (
                  <div key={att.id} className="p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar name={att.name} size={24} />
                      <span className="font-semibold text-ink">{att.name}</span>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        att.rsvp === 'Accepted'
                          ? 'bg-good/20 text-good'
                          : att.rsvp === 'Declined'
                          ? 'bg-bad/20 text-bad'
                          : 'bg-warn/20 text-warn'
                      }`}
                    >
                      {att.rsvp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action items checklist */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted font-mono">
                  Action Items Checklist
                </span>
                <button
                  type="button"
                  onClick={() => {
                    notify('Redirecting action item to Tasks board');
                    if (onNavigate) onNavigate('/dashboard/tasks');
                  }}
                  className="text-[11.5px] text-accent font-bold hover:underline flex items-center gap-1"
                >
                  <ListTodo size={13} />
                  <span>Create task</span>
                </button>
              </div>

              {selectedMeeting.actionItems?.length === 0 ? (
                <p className="text-[12px] text-muted italic">No action items recorded yet.</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {selectedMeeting.actionItems.map((ai) => (
                    <label key={ai.id} className="flex items-center gap-2 cursor-pointer text-[12px]">
                      <input
                        type="checkbox"
                        checked={ai.done}
                        onChange={() => {
                          const updated = {
                            ...selectedMeeting,
                            actionItems: selectedMeeting.actionItems.map((x) =>
                              x.id === ai.id ? { ...x, done: !x.done } : x
                            ),
                          };
                          setSelectedMeeting(updated);
                          setMeetings(meetings.map((m) => (m.id === updated.id ? updated : m)));
                        }}
                        className="rounded bg-surface2 border-line text-accent w-3.5 h-3.5"
                      />
                      <span className={ai.done ? 'line-through text-muted' : 'text-ink'}>
                        {ai.text}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Notes textarea */}
            <FormField label="Meeting Notes" id="meet-notes">
              <Textarea
                id="meet-notes"
                value={meetingNotes || selectedMeeting.notes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                placeholder="Key meeting takeaways, technical decisions..."
                rows={3}
              />
            </FormField>

            <div className="flex justify-end pt-2 border-t border-line">
              <button
                type="button"
                onClick={() => {
                  notify('Meeting notes saved');
                  setSelectedMeeting(null);
                }}
                className="px-4 py-2 bg-accent text-on-accent text-[12.5px] font-bold rounded-xl"
              >
                Save Notes
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

