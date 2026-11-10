import React, { useState } from 'react';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Calendar({
  days = [],
  selectedDay = 6, // today is 6 Nov
  onSelectDay,
  className = '',
}) {
  const [activeDay, setActiveDay] = useState(selectedDay);

  const handleDayClick = (dayNumber) => {
    setActiveDay(dayNumber);
    if (onSelectDay) onSelectDay(dayNumber);
  };

  // Find details for active day
  const activeDayData = days.find((d) => d.day === activeDay);

  // In Nov 2026, Nov 1 is Sunday.
  // In Monday-first calendar (Mon, Tue, Wed, Thu, Fri, Sat, Sun):
  // Sunday is column 7. So there are 6 empty cells before day 1!
  const emptyPaddingDays = 6;

  return (
    <div className={`w-full flex flex-col gap-3 ${className}`}>
      {/* Calendar Legend and Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-muted">
        <span className="font-semibold text-ink">Team leave · November 2026</span>
        <div className="flex items-center gap-3 text-[11.5px]">
          <span className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: 'var(--accent2)' }}
            />
            Filled dot approved
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full inline-block border"
              style={{ borderColor: 'var(--accent2)', backgroundColor: 'transparent' }}
            />
            Hollow dot pending
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[7px] inline-block"
              style={{ borderBottomColor: 'var(--warn)' }}
            />
            Holiday
          </span>
        </div>
      </div>

      {/* Weekday Header */}
      <div className="grid grid-cols-7 gap-1 text-center text-[12px] font-semibold text-muted py-1">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="py-0.5">
            {wd}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 select-none">
        {/* Leading empty cells for Nov 2026 */}
        {Array.from({ length: emptyPaddingDays }).map((_, idx) => (
          <div
            key={`empty-${idx}`}
            className="min-h-[64px] rounded-xl bg-transparent border border-transparent opacity-10"
          />
        ))}

        {days.map((dayItem) => {
          const isSelected = activeDay === dayItem.day;
          const isToday = dayItem.isToday;
          const hasHoliday = !!dayItem.holiday;
          const isWeekend = dayItem.isWeekend;

          return (
            <button
              key={dayItem.day}
              type="button"
              onClick={() => handleDayClick(dayItem.day)}
              className={`min-h-[64px] p-1.5 rounded-xl text-left relative flex flex-col justify-between transition-all duration-150 group focus-visible:outline-none ${
                isWeekend ? 'opacity-55' : 'opacity-100'
              } ${
                isSelected
                  ? 'ring-2 ring-accent border-accent/80 bg-surface2 shadow-md'
                  : 'bg-surface2/60 hover:bg-surface2 hover:border-line border border-line/60'
              }`}
              style={{
                borderColor: isToday ? 'var(--accent)' : undefined,
              }}
              aria-label={`November ${dayItem.day}, 2026`}
            >
              {/* Day Number and Holiday indicator */}
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-[13px] font-mono tabular-nums leading-none font-bold ${
                    isToday ? 'text-accent' : isSelected ? 'text-ink' : 'text-muted'
                  }`}
                >
                  {dayItem.day}
                </span>

                {hasHoliday && (
                  <span
                    className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[7px] shrink-0"
                    style={{ borderBottomColor: 'var(--warn)' }}
                    title={dayItem.holiday}
                  />
                )}
              </div>

              {/* Leave Dots Container */}
              <div className="flex items-center gap-1 mt-auto pt-1 flex-wrap">
                {/* Approved Leave Dots (filled violet) */}
                {dayItem.approvedLeave &&
                  dayItem.approvedLeave.map((person, pIdx) => (
                    <span
                      key={`app-${pIdx}`}
                      className="w-[7px] h-[7px] rounded-full shrink-0"
                      style={{ backgroundColor: 'var(--accent2)' }}
                      title={`Approved: ${person}`}
                    />
                  ))}

                {/* Pending Leave Dots (hollow violet) */}
                {dayItem.pendingLeave &&
                  dayItem.pendingLeave.map((person, pIdx) => (
                    <span
                      key={`pen-${pIdx}`}
                      className="w-[7px] h-[7px] rounded-full shrink-0 border"
                      style={{
                        borderColor: 'var(--accent2)',
                        backgroundColor: 'transparent',
                      }}
                      title={`Pending: ${person}`}
                    />
                  ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Info Box with Dashed Border */}
      {activeDayData && (
        <div
          className="p-3.5 rounded-xl border border-dashed border-line bg-surface/80 flex flex-col gap-2 mt-2 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-ink flex items-center gap-2">
              <span>{activeDayData.day} November 2026 ({activeDayData.weekday})</span>
              {activeDayData.isToday && (
                <span className="text-[10.5px] px-2 py-0.5 rounded-full font-bold uppercase bg-accent text-on-accent">
                  Today
                </span>
              )}
            </span>
            {activeDayData.holiday && (
              <span className="text-[12px] text-warn font-medium flex items-center gap-1">
                ★ Holiday: {activeDayData.holiday}
              </span>
            )}
          </div>

          <div className="text-[12px] text-muted flex flex-col gap-1.5 font-body">
            {activeDayData.approvedLeave.length === 0 && activeDayData.pendingLeave.length === 0 ? (
              <p className="italic text-muted/80">No team members on leave on this day.</p>
            ) : (
              <>
                {activeDayData.approvedLeave.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-accent2 font-semibold">Approved leave:</span>
                    {activeDayData.approvedLeave.map((name, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-surface2 text-ink border border-line/60"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                )}
                {activeDayData.pendingLeave.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    <span className="text-warn font-semibold">Pending approval:</span>
                    {activeDayData.pendingLeave.map((name, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-surface2 text-ink border border-warn/40"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

