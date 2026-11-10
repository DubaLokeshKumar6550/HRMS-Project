import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Download, SlidersHorizontal, Palette, ChevronDown, Check, X } from 'lucide-react';
import Avatar from './Avatar';
import AccountMenu from './AccountMenu';
import PunchControl from './attendance/PunchControl.jsx';
import GlobalSearchDropdown from './GlobalSearchDropdown';

const DIVISIONS = [
  'Engineering Division · Bengaluru',
  'Platform & Infrastructure · Hyderabad',
  'Data Engineering & BI · Pune',
];

export default function Header({
  pageTitle,
  searchQuery,
  onSearchChange,
  isCompact,
  onToggleCompact,
  accentTheme,
  onToggleAccent,
  pendingCount = 7,
  onOpenExportModal,
  onToggleNotifications,
  isNotificationsOpen,
  user,
  onNavigate,
  onOpenShortcuts,
  onSignOut,
  employees = [],
  onSelectEmployee,
  pendingRequests = [],
}) {
  const [selectedDivision, setSelectedDivision] = useState(DIVISIONS[0]);
  const [isDivMenuOpen, setIsDivMenuOpen] = useState(false);
  const divMenuRef = useRef(null);

  // Account menu state
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const avatarBtnRef = useRef(null);

  // Global search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (divMenuRef.current && !divMenuRef.current.contains(event.target)) {
        setIsDivMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global Ctrl+K / Cmd+K shortcut to focus search input
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          setIsSearchOpen(Boolean(searchQuery?.trim()));
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

  return (
    <header className="flex flex-col gap-3 pb-3 border-b border-line/40 pt-1">
      {/* Upper Utility Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[12px] font-mono text-muted">
        {/* Left Breadcrumb / App Context with Interactive Division Dropdown */}
        <div className="relative" ref={divMenuRef}>
          <button
            type="button"
            onClick={() => setIsDivMenuOpen(!isDivMenuOpen)}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity p-1 rounded-lg hover:bg-surface2/40 text-left select-none"
            aria-expanded={isDivMenuOpen}
            aria-haspopup="true"
          >
            <span className="text-[12px] font-semibold text-ink flex items-center gap-1.5">
              <span>HRMS Manager Desk</span>
              <ChevronDown size={12} className={`text-muted transition-transform ${isDivMenuOpen ? 'rotate-180' : ''}`} />
            </span>
            <span className="text-line">|</span>
            <span className="text-[11px] text-muted hidden sm:inline font-mono">
              {selectedDivision}
            </span>
          </button>

          {/* Division Selector Dropdown */}
          {isDivMenuOpen && (
            <div className="absolute left-0 top-9 z-50 w-72 rounded-xl bg-[#0a222b] border border-line p-1.5 shadow-2xl flex flex-col gap-1 text-[12px] animate-in fade-in zoom-in-95">
              <span className="px-2.5 py-1 text-[10.5px] uppercase font-semibold text-muted tracking-wider">
                Select Engineering Unit
              </span>
              {DIVISIONS.map((div) => {
                const isSelected = selectedDivision === div;
                return (
                  <button
                    key={div}
                    type="button"
                    onClick={() => {
                      setSelectedDivision(div);
                      setIsDivMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-surface2 text-accent font-semibold'
                        : 'text-muted hover:text-ink hover:bg-surface2/60'
                    }`}
                  >
                    <span>{div}</span>
                    {isSelected && <Check size={13} className="text-accent" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Utility Buttons & Controls */}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {/* Theme Accent Switcher (Amber [Screenshot] <-> Mint [Spec]) */}
          <button
            type="button"
            onClick={onToggleAccent}
            title={`Switch Accent Theme (Current: ${accentTheme === 'amber' ? 'Amber / Screenshot' : 'Mint / Spec'})`}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-line text-[11px] font-medium text-muted hover:text-ink hover:border-accent transition-colors active:scale-95"
          >
            <Palette size={13} className="text-accent" />
            <span className="capitalize">{accentTheme} Theme</span>
          </button>

          {/* Compact Density Switcher */}
          <button
            type="button"
            onClick={onToggleCompact}
            title="Toggle Compact Density (--pad: 12px, --gap: 10px)"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-colors active:scale-95 ${
              isCompact
                ? 'bg-surface2 text-ink border-accent'
                : 'bg-surface text-muted border-line hover:text-ink'
            }`}
          >
            <SlidersHorizontal size={12} />
            <span>{isCompact ? 'Compact' : 'Normal'}</span>
          </button>

          {/* Export Button (Opens real download modal) */}
          <button
            type="button"
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface2 text-ink border border-line hover:border-accent text-[12px] font-semibold transition-all shadow-sm active:scale-95"
          >
            <Download size={13} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main Title & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Page H1 */}
        <h1
          className="font-display font-bold text-ink tracking-tight leading-none"
          style={{ fontSize: 'clamp(24px, 3.4vw, 36px)' }}
        >
          {pageTitle}
        </h1>

        {/* Search, Notifications & Context Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Global Search Input with Live Dropdown & Keyboard Shortcut */}
          <div className="relative min-w-[210px] sm:min-w-[280px] lg:min-w-[320px]" ref={searchContainerRef}>
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => {
                if (searchQuery?.trim()) setIsSearchOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsSearchOpen(false);
                }
              }}
              placeholder="Search team or records..."
              aria-label="Global search input"
              className="w-full bg-surface2 border border-line rounded-full py-1.5 pl-8 pr-12 text-[12px] text-ink placeholder-muted/70 focus:outline-none focus:border-accent transition-colors"
            />

            {/* Right inside input: Clear (X) or Ctrl K hint */}
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange('');
                    setIsSearchOpen(false);
                    searchInputRef.current?.focus();
                  }}
                  className="p-0.5 rounded-full hover:bg-surface text-muted hover:text-ink transition-colors cursor-pointer"
                  title="Clear search"
                  aria-label="Clear search query"
                >
                  <X size={13} />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9.5px] font-mono text-muted/60 bg-surface/60 border border-line rounded select-none">
                  Ctrl K
                </kbd>
              )}
            </div>

            {/* Live Search Results Dropdown */}
            <GlobalSearchDropdown
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              employees={employees}
              onSelectEmployee={onSelectEmployee}
              onNavigate={onNavigate}
              pendingRequests={pendingRequests}
            />
          </div>

          {/* Header Punch Control (All pages, left of the bell) */}
          <PunchControl
            onNavigateToMine={() => onNavigate?.('/dashboard/attendance?view=mine')}
          />

          {/* Notification Button with Violet Dot */}
          <div className="relative">
            <button
              type="button"
              onClick={onToggleNotifications}
              aria-label={`Notifications, ${pendingCount} pending`}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors relative active:scale-95 ${
                isNotificationsOpen
                  ? 'bg-accent/20 border-accent text-accent'
                  : 'bg-surface2 border-line text-muted hover:text-ink hover:border-accent'
              }`}
            >
              <Bell size={15} />
              {pendingCount > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--accent2)' }}
                />
              )}
            </button>
          </div>

          {/* Manager 34px Avatar Button triggering AccountMenu */}
          <div className="relative">
            <button
              ref={avatarBtnRef}
              type="button"
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={isAccountMenuOpen}
              className="w-[34px] h-[34px] rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {user?.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt={user.name || 'Priya Nair'}
                  className="w-[34px] h-[34px] rounded-full object-cover ring-1 ring-accent"
                />
              ) : (
                <Avatar name={user?.name || 'Priya Nair'} size={34} />
              )}
            </button>

            <AccountMenu
              isOpen={isAccountMenuOpen}
              onClose={() => setIsAccountMenuOpen(false)}
              triggerRef={avatarBtnRef}
              user={user}
              onNavigate={onNavigate}
              onOpenShortcuts={onOpenShortcuts}
              onSignOut={onSignOut}
            />
          </div>

          {/* Context Chips (Pill, 1px line border, surface bg, 12px data font, muted) */}
          <div className="hidden xl:flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full border border-line bg-surface text-[11px] font-mono tabular-nums text-muted select-none">
              IN · INR ₹
            </span>
            <span className="px-2.5 py-1 rounded-full border border-line bg-surface text-[11px] font-mono tabular-nums text-muted select-none">
              IST (UTC+5:30)
            </span>
            <span className="px-2.5 py-1 rounded-full border border-line bg-surface text-[11px] font-mono tabular-nums text-muted select-none">
              FY 2026–27
            </span>
            <span className="px-2.5 py-1 rounded-full border border-line bg-surface text-[11px] font-mono tabular-nums text-muted select-none">
              Sample data · 6 Nov 2026
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
