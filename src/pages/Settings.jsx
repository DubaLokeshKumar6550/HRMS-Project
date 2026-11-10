import React, { useState, useEffect, useMemo, useRef } from 'react';
import Card from '../components/Card';
import Switch from '../components/Switch';
import SettingsMenu, { SETTINGS_SECTIONS } from '../components/SettingsMenu';
import SessionsTable from '../components/SessionsTable';
import PreferenceMatrix from '../components/PreferenceMatrix';
import Drawer from '../components/Drawer';
import Tag from '../components/Tag';
import StatusPill from '../components/StatusPill';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';
import { defaultSettings } from '../data/settings';
import {
  Shield,
  Bell,
  Sliders,
  CheckCircle,
  Calendar,
  Eye,
  Key,
  Smartphone,
  Lock,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  Save,
  Download,
  Trash2,
  Plus,
  Send,
  CalendarDays,
  Clock,
  Info,
} from 'lucide-react';

export default function Settings({ onTriggerToast, onSendTestNotification }) {
  const { settings, updateSettingsSection } = useAuth();

  // URL sync for active section (?section=security|notif|prefs|approve|integr|privacy)
  const [activeSection, setActiveSection] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const sec = params.get('section');
    return ['security', 'notif', 'prefs', 'approve', 'integr', 'privacy'].includes(sec)
      ? sec
      : 'security';
  });

  // Track pending section navigation for unsaved changes confirmation
  const [pendingSection, setPendingSection] = useState(null);
  const [isUnsavedDrawerOpen, setIsUnsavedDrawerOpen] = useState(false);

  // Synchronize URL on section change
  const navigateSection = (sectionId, bypassDirtyCheck = false) => {
    if (!bypassDirtyCheck && isCurrentSectionDirty(activeSection)) {
      setPendingSection(sectionId);
      setIsUnsavedDrawerOpen(true);
      return;
    }

    setActiveSection(sectionId);
    const url = new URL(window.location);
    url.searchParams.set('section', sectionId);
    window.history.pushState(null, '', url.toString());
  };

  // ==========================================
  // Section 5.1: SECURITY STATE
  // ==========================================
  const [passwordState, setPasswordState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Two-step verification state
  const [is2FADrawerOpen, setIs2FADrawerOpen] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Sessions state
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    let mounted = true;
    profileService.listSessions().then((res) => {
      if (mounted) setSessions(res);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Revoke session
  const handleRevokeSession = async (sessionId) => {
    try {
      const updated = await profileService.revokeSession(sessionId);
      setSessions(updated);
      onTriggerToast?.('Session signed out successfully.');
    } catch {
      onTriggerToast?.('Failed to sign out session.');
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    try {
      const updated = await profileService.revokeAllOtherSessions();
      setSessions(updated);
      onTriggerToast?.('Signed out of all other devices.');
    } catch {
      onTriggerToast?.('Failed to sign out other devices.');
    }
  };

  // Password rules validation & strength calculation
  const passwordCriteria = useMemo(() => {
    const pw = passwordState.newPassword;
    return {
      length: pw.length >= 8,
      uppercase: /[A-Z]/.test(pw),
      number: /[0-9]/.test(pw),
      special: /[^A-Za-z0-9]/.test(pw),
      differentFromCurrent:
        Boolean(pw) && pw !== passwordState.currentPassword,
    };
  }, [passwordState.newPassword, passwordState.currentPassword]);

  const passwordStrengthScore = useMemo(() => {
    const { length, uppercase, number, special } = passwordCriteria;
    return [length, uppercase, number, special].filter(Boolean).length;
  }, [passwordCriteria]);

  const getStrengthLabel = (score) => {
    if (score === 0) return { label: 'None', color: 'bg-line' };
    if (score === 1) return { label: 'Weak', color: 'bg-bad' };
    if (score === 2) return { label: 'Fair', color: 'bg-warn' };
    if (score === 3) return { label: 'Good', color: 'bg-info' };
    return { label: 'Strong', color: 'bg-good' };
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!passwordState.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    if (passwordStrengthScore < 4 || !passwordCriteria.differentFromCurrent) {
      errors.newPassword = 'New password does not meet all security rules';
    }
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordErrors({});
    try {
      await profileService.changePassword(
        passwordState.currentPassword,
        passwordState.newPassword
      );
      setPasswordState({ currentPassword: '', newPassword: '', confirmPassword: '' });
      onTriggerToast?.('Account password updated successfully.');
    } catch (err) {
      setPasswordErrors({ form: err.message || 'Failed to update password' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Two-factor toggle handler
  const handleToggle2FA = (checked) => {
    if (checked) {
      setTwoFactorCode('');
      setTwoFactorError('');
      setIs2FADrawerOpen(true);
    } else {
      updateSettingsSection('security', { twoStepEnabled: false });
      onTriggerToast?.('Two-step verification turned off.');
    }
  };

  const handleConfirm2FA = (e) => {
    e.preventDefault();
    if (twoFactorCode !== '123456') {
      setTwoFactorError('Invalid verification code. Enter 123456 in sample mode.');
      return;
    }
    updateSettingsSection('security', { twoStepEnabled: true });
    setIs2FADrawerOpen(false);
    onTriggerToast?.('Two-step verification enabled successfully.');
  };

  const handleCopyBackupCodes = () => {
    const codes = (settings?.security?.backupCodes || defaultSettings.security.backupCodes).join('\n');
    navigator.clipboard.writeText(codes);
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
    onTriggerToast?.('Backup codes copied to clipboard.');
  };

  // ==========================================
  // Section 5.2: NOTIFICATIONS STATE
  // ==========================================
  const [notifState, setNotifState] = useState(() => ({
    preferenceMatrix: settings?.notifications?.preferenceMatrix || defaultSettings.notifications.preferenceMatrix,
    emailDigest: settings?.notifications?.emailDigest || defaultSettings.notifications.emailDigest,
    quietHoursEnabled: settings?.notifications?.quietHoursEnabled ?? defaultSettings.notifications.quietHoursEnabled,
    quietHoursFrom: settings?.notifications?.quietHoursFrom || defaultSettings.notifications.quietHoursFrom,
    quietHoursTo: settings?.notifications?.quietHoursTo || defaultSettings.notifications.quietHoursTo,
    allowUrgentApprovals: settings?.notifications?.allowUrgentApprovals ?? defaultSettings.notifications.allowUrgentApprovals,
    remindApprovalsEvery: settings?.notifications?.remindApprovalsEvery || defaultSettings.notifications.remindApprovalsEvery,
  }));

  useEffect(() => {
    if (settings?.notifications) {
      setNotifState((prev) => ({
        ...prev,
        ...settings.notifications,
      }));
    }
  }, [settings?.notifications]);

  // ==========================================
  // Section 5.3: PREFERENCES STATE
  // ==========================================
  const [prefsState, setPrefsState] = useState(() => ({
    language: settings?.preferences?.language || defaultSettings.preferences.language,
    timeZone: settings?.preferences?.timeZone || defaultSettings.preferences.timeZone,
    dateFormat: settings?.preferences?.dateFormat || defaultSettings.preferences.dateFormat,
    numberFormat: settings?.preferences?.numberFormat || defaultSettings.preferences.numberFormat,
    weekStartsOn: settings?.preferences?.weekStartsOn || defaultSettings.preferences.weekStartsOn,
    defaultLandingPage: settings?.preferences?.defaultLandingPage || defaultSettings.preferences.defaultLandingPage,
    displayDensity: settings?.preferences?.displayDensity || defaultSettings.preferences.displayDensity,
    reduceMotion: settings?.preferences?.reduceMotion ?? defaultSettings.preferences.reduceMotion,
  }));

  useEffect(() => {
    if (settings?.preferences) {
      setPrefsState((prev) => ({
        ...prev,
        ...settings.preferences,
      }));
    }
  }, [settings?.preferences]);

  // ==========================================
  // Section 5.4: APPROVALS & DELEGATION STATE
  // ==========================================
  const [approveState, setApproveState] = useState(() => ({
    active: settings?.delegation?.active ?? defaultSettings.delegation.active,
    delegatePersonId: settings?.delegation?.delegatePersonId || defaultSettings.delegation.delegatePersonId,
    delegatePersonName: settings?.delegation?.delegatePersonName || defaultSettings.delegation.delegatePersonName,
    fromDate: settings?.delegation?.fromDate || defaultSettings.delegation.fromDate,
    toDate: settings?.delegation?.toDate || defaultSettings.delegation.toDate,
    scopes: settings?.delegation?.scopes || defaultSettings.delegation.scopes,
    escalateAfter: settings?.delegation?.escalateAfter || defaultSettings.delegation.escalateAfter,
    escalateTo: settings?.delegation?.escalateTo || defaultSettings.delegation.escalateTo,
    outOfOfficeEnabled: settings?.delegation?.outOfOfficeEnabled ?? defaultSettings.delegation.outOfOfficeEnabled,
    outOfOfficeFrom: settings?.delegation?.outOfOfficeFrom || defaultSettings.delegation.outOfOfficeFrom,
    outOfOfficeTo: settings?.delegation?.outOfOfficeTo || defaultSettings.delegation.outOfOfficeTo,
    outOfOfficeMessage: settings?.delegation?.outOfOfficeMessage || defaultSettings.delegation.outOfOfficeMessage,
    quickReplies: settings?.delegation?.quickReplies || defaultSettings.delegation.quickReplies,
  }));

  const [newQuickReply, setNewQuickReply] = useState('');

  useEffect(() => {
    if (settings?.delegation) {
      setApproveState((prev) => ({
        ...prev,
        ...settings.delegation,
      }));
    }
  }, [settings?.delegation]);

  // ==========================================
  // Section 5.5: CALENDAR & INTEGRATIONS STATE
  // ==========================================
  const [integrState, setIntegrState] = useState(() => ({
    googleCalendar: settings?.integrations?.googleCalendar ?? defaultSettings.integrations.googleCalendar,
    outlookCalendar: settings?.integrations?.outlookCalendar ?? defaultSettings.integrations.outlookCalendar,
    microsoftTeams: settings?.integrations?.microsoftTeams ?? defaultSettings.integrations.microsoftTeams,
    slack: settings?.integrations?.slack ?? defaultSettings.integrations.slack,
    autoAddMeetings: settings?.integrations?.autoAddMeetings ?? defaultSettings.integrations.autoAddMeetings,
  }));

  useEffect(() => {
    if (settings?.integrations) {
      setIntegrState((prev) => ({
        ...prev,
        ...settings.integrations,
      }));
    }
  }, [settings?.integrations]);

  // ==========================================
  // Section 5.6: PRIVACY & DATA STATE
  // ==========================================
  const [privacyState, setPrivacyState] = useState(() => ({
    showMobileNumber: settings?.privacy?.showMobileNumber ?? defaultSettings.privacy.showMobileNumber,
    showPersonalEmail: settings?.privacy?.showPersonalEmail ?? defaultSettings.privacy.showPersonalEmail,
    showBirthdayCalendar: settings?.privacy?.showBirthdayCalendar ?? defaultSettings.privacy.showBirthdayCalendar,
    showWorkAnniversary: settings?.privacy?.showWorkAnniversary ?? defaultSettings.privacy.showWorkAnniversary,
    exportsHistory: settings?.privacy?.exportsHistory || defaultSettings.privacy.exportsHistory,
  }));

  const [isDeactivateDrawerOpen, setIsDeactivateDrawerOpen] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [deactivateUnderstood, setDeactivateUnderstood] = useState(false);
  const [isSubmittingDeactivation, setIsSubmittingDeactivation] = useState(false);

  useEffect(() => {
    if (settings?.privacy) {
      setPrivacyState((prev) => ({
        ...prev,
        ...settings.privacy,
      }));
    }
  }, [settings?.privacy]);

  // ==========================================
  // DIRTY STATE CALCULATIONS
  // ==========================================
  const isCurrentSectionDirty = (secId) => {
    switch (secId) {
      case 'notif':
        return JSON.stringify(notifState) !== JSON.stringify(settings?.notifications || defaultSettings.notifications);
      case 'prefs':
        return JSON.stringify(prefsState) !== JSON.stringify(settings?.preferences || defaultSettings.preferences);
      case 'approve':
        return JSON.stringify(approveState) !== JSON.stringify(settings?.delegation || defaultSettings.delegation);
      case 'integr':
        return JSON.stringify(integrState) !== JSON.stringify(settings?.integrations || defaultSettings.integrations);
      case 'privacy':
        return JSON.stringify(privacyState) !== JSON.stringify(settings?.privacy || defaultSettings.privacy);
      case 'security':
        return Boolean(passwordState.currentPassword || passwordState.newPassword || passwordState.confirmPassword);
      default:
        return false;
    }
  };

  const isDirty = isCurrentSectionDirty(activeSection);
  const [isSaving, setIsSaving] = useState(false);

  // Global save handler per section
  const handleSaveSection = async () => {
    setIsSaving(true);
    try {
      if (activeSection === 'notif') {
        await updateSettingsSection('notifications', notifState);
        onTriggerToast?.('Notification preferences saved.');
      } else if (activeSection === 'prefs') {
        await updateSettingsSection('preferences', prefsState);
        onTriggerToast?.('System preferences saved.');
      } else if (activeSection === 'approve') {
        await updateSettingsSection('delegation', approveState);
        onTriggerToast?.('Approval and delegation settings saved.');
      } else if (activeSection === 'integr') {
        await updateSettingsSection('integrations', integrState);
        onTriggerToast?.('Calendar & integration preferences saved.');
      } else if (activeSection === 'privacy') {
        await updateSettingsSection('privacy', privacyState);
        onTriggerToast?.('Privacy settings saved.');
      }
    } catch {
      onTriggerToast?.('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults / Discard handler per section
  const handleResetSection = () => {
    switch (activeSection) {
      case 'notif':
        setNotifState(settings?.notifications || defaultSettings.notifications);
        break;
      case 'prefs':
        setPrefsState(settings?.preferences || defaultSettings.preferences);
        break;
      case 'approve':
        setApproveState(settings?.delegation || defaultSettings.delegation);
        break;
      case 'integr':
        setIntegrState(settings?.integrations || defaultSettings.integrations);
        break;
      case 'privacy':
        setPrivacyState(settings?.privacy || defaultSettings.privacy);
        break;
      case 'security':
        setPasswordState({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordErrors({});
        break;
      default:
        break;
    }
    onTriggerToast?.('Changes discarded.');
  };

  // Quick reply comment chip helpers
  const handleAddQuickReply = () => {
    if (!newQuickReply.trim()) return;
    if (approveState.quickReplies.length >= 5) {
      onTriggerToast?.('Maximum 5 quick reply comments allowed.');
      return;
    }
    setApproveState((prev) => ({
      ...prev,
      quickReplies: [...prev.quickReplies, newQuickReply.trim()],
    }));
    setNewQuickReply('');
  };

  const handleRemoveQuickReply = (idx) => {
    setApproveState((prev) => ({
      ...prev,
      quickReplies: prev.quickReplies.filter((_, i) => i !== idx),
    }));
  };

  // Export Data Trigger
  const handleTriggerDataExport = () => {
    onTriggerToast?.('Your data export is being prepared.');
    const newExport = {
      id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
      date: '6 Nov 2026',
      type: 'Manager Profile & Activity Archive (JSON)',
      status: 'Processing',
      size: '2.1 MB',
    };
    const updatedHistory = [newExport, ...privacyState.exportsHistory];
    setPrivacyState((prev) => ({ ...prev, exportsHistory: updatedHistory }));
    updateSettingsSection('privacy', { exportsHistory: updatedHistory });
  };

  // Account Deactivation
  const handleDeactivateAccount = async (e) => {
    e.preventDefault();
    if (!deactivateUnderstood) return;
    setIsSubmittingDeactivation(true);
    setTimeout(() => {
      setIsSubmittingDeactivation(false);
      setIsDeactivateDrawerOpen(false);
      setDeactivateReason('');
      setDeactivateUnderstood(false);
      onTriggerToast?.('Deactivation request submitted for HR review.');
    }, 600);
  };

  // Delegation Start & End Handlers
  const handleStartDelegation = () => {
    const previous = { ...approveState };
    setApproveState((prev) => ({ ...prev, active: true }));
    updateSettingsSection('delegation', { ...approveState, active: true });
    onTriggerToast?.(
      `Delegated approvals to ${approveState.delegatePersonName} (${approveState.fromDate} – ${approveState.toDate}).`,
      () => {
        setApproveState(previous);
        updateSettingsSection('delegation', previous);
      }
    );
  };

  const handleEndDelegation = () => {
    const previous = { ...approveState };
    setApproveState((prev) => ({ ...prev, active: false }));
    updateSettingsSection('delegation', { ...approveState, active: false });
    onTriggerToast?.('Delegation ended.', () => {
      setApproveState(previous);
      updateSettingsSection('delegation', previous);
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
      {/* 2-Column Responsive Layout: Left Menu (220px on >=900px) + Right Content Card */}
      <div className="flex flex-col lg:flex-row gap-5 items-start w-full">
        {/* Settings Navigation Menu */}
        <SettingsMenu
          activeSection={activeSection}
          onSelectSection={navigateSection}
          className="shrink-0"
        />

        {/* Active Section Content Card */}
        <div className="flex-1 w-full min-w-0">
          <Card
            title={SETTINGS_SECTIONS.find((s) => s.id === activeSection)?.label || 'Settings'}
            subtitle="Configure managerial controls, system preferences and automated workflows"
            headerAction={
              activeSection !== 'security' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetSection}
                    disabled={!isDirty || isSaving}
                    className="px-3 py-1.5 rounded-xl bg-surface2 text-muted hover:text-ink text-[12px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <RotateCcw size={13} />
                    <span>Discard</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveSection}
                    disabled={!isDirty || isSaving}
                    className="px-4 py-1.5 rounded-xl font-display font-bold text-[12px] shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: 'var(--on-accent)',
                      borderRadius: 'var(--radius)',
                    }}
                  >
                    <Save size={13} />
                    <span>{isSaving ? 'Saving…' : 'Save changes'}</span>
                  </button>
                </div>
              )
            }
          >
            {/* ---------------------------------------------------- */}
            {/* 5.1 SECURITY SECTION */}
            {/* ---------------------------------------------------- */}
            {activeSection === 'security' && (
              <div className="flex flex-col gap-8 w-full">
                {/* Change Password Card */}
                <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4 p-4 rounded-xl bg-surface/40 border border-line">
                  <div className="flex items-center gap-2">
                    <Key size={16} className="text-accent" />
                    <h3 className="font-display font-bold text-[14px] text-ink">
                      Change account password
                    </h3>
                  </div>

                  {passwordErrors.form && (
                    <div className="p-2.5 rounded-lg bg-bad/10 border border-bad/30 text-bad text-[12px] flex items-center gap-2">
                      <AlertTriangle size={14} className="shrink-0" />
                      <span>{passwordErrors.form}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Current Password */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-semibold text-muted" htmlFor="currentPassword">
                        Current password
                      </label>
                      <input
                        id="currentPassword"
                        type="password"
                        value={passwordState.currentPassword}
                        onChange={(e) => setPasswordState((prev) => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full bg-surface2 border border-line rounded-xl px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-accent"
                        placeholder="••••••••••••"
                      />
                      {passwordErrors.currentPassword && (
                        <span className="text-[11px] text-bad">{passwordErrors.currentPassword}</span>
                      )}
                    </div>

                    {/* New Password */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-semibold text-muted" htmlFor="newPassword">
                        New password
                      </label>
                      <input
                        id="newPassword"
                        type="password"
                        value={passwordState.newPassword}
                        onChange={(e) => setPasswordState((prev) => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full bg-surface2 border border-line rounded-xl px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-accent"
                        placeholder="••••••••••••"
                      />
                      {passwordErrors.newPassword && (
                        <span className="text-[11px] text-bad">{passwordErrors.newPassword}</span>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-semibold text-muted" htmlFor="confirmPassword">
                        Confirm new password
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={passwordState.confirmPassword}
                        onChange={(e) => setPasswordState((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full bg-surface2 border border-line rounded-xl px-3 py-2 text-[13px] text-ink focus:outline-none focus:border-accent"
                        placeholder="••••••••••••"
                      />
                      {passwordErrors.confirmPassword && (
                        <span className="text-[11px] text-bad">{passwordErrors.confirmPassword}</span>
                      )}
                    </div>
                  </div>

                  {/* Password Strength Meter & Checklist */}
                  {passwordState.newPassword && (
                    <div className="flex flex-col gap-2 pt-1 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted font-medium">Password strength</span>
                        <span className="font-semibold text-ink">
                          {getStrengthLabel(passwordStrengthScore).label}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full bg-surface2 rounded-full overflow-hidden">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-full transition-all duration-300 ${
                              step <= passwordStrengthScore
                                ? getStrengthLabel(passwordStrengthScore).color
                                : 'bg-transparent'
                            }`}
                          />
                        ))}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                        <span className={`flex items-center gap-1.5 ${passwordCriteria.length ? 'text-good' : 'text-muted'}`}>
                          {passwordCriteria.length ? <Check size={12} /> : '•'} At least 8 chars
                        </span>
                        <span className={`flex items-center gap-1.5 ${passwordCriteria.uppercase ? 'text-good' : 'text-muted'}`}>
                          {passwordCriteria.uppercase ? <Check size={12} /> : '•'} 1 Uppercase letter
                        </span>
                        <span className={`flex items-center gap-1.5 ${passwordCriteria.number ? 'text-good' : 'text-muted'}`}>
                          {passwordCriteria.number ? <Check size={12} /> : '•'} 1 Number
                        </span>
                        <span className={`flex items-center gap-1.5 ${passwordCriteria.special ? 'text-good' : 'text-muted'}`}>
                          {passwordCriteria.special ? <Check size={12} /> : '•'} 1 Special character
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isUpdatingPassword || !passwordState.newPassword}
                      className="px-4 py-2 rounded-xl font-display font-bold text-[12.5px] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                      style={{
                        backgroundColor: 'var(--accent)',
                        color: 'var(--on-accent)',
                        borderRadius: 'var(--radius)',
                      }}
                    >
                      {isUpdatingPassword ? 'Updating…' : 'Update password'}
                    </button>
                  </div>
                </form>

                {/* Two-step Verification Card */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface/40 border border-line gap-4 flex-wrap sm:flex-nowrap">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-surface2 border border-line shrink-0 text-accent">
                      <Smartphone size={20} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-display font-bold text-[14px] text-ink">
                        Two-step verification (2FA)
                      </span>
                      <p className="text-[12.5px] text-muted max-w-[55ch]">
                        Protect your manager account with an authenticator app or SMS code upon sign-in.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[12px] font-semibold text-muted">
                      {settings?.security?.twoStepEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <Switch
                      checked={Boolean(settings?.security?.twoStepEnabled)}
                      onChange={handleToggle2FA}
                      aria-label="Toggle two-step verification"
                    />
                  </div>
                </div>

                {/* Active Sessions Table */}
                <SessionsTable
                  sessions={sessions}
                  onRevokeSession={handleRevokeSession}
                  onRevokeAllOtherSessions={handleRevokeAllOtherSessions}
                />

                {/* Login History List (Last 10 sign-ins) */}
                <div className="flex flex-col gap-3">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-muted font-mono">
                    Recent Login History (Last 10 Sign-ins)
                  </span>

                  <div className="overflow-x-auto w-full rounded-xl border border-line bg-surface/30">
                    <table className="w-full border-collapse text-left min-w-[560px] text-[12px]">
                      <thead>
                        <tr className="border-b border-line bg-surface2/50 text-[10.5px] font-bold uppercase tracking-wider text-muted font-mono">
                          <th className="py-2.5 px-3">Date & Time</th>
                          <th className="py-2.5 px-3">Device & Browser</th>
                          <th className="py-2.5 px-3">Location</th>
                          <th className="py-2.5 px-3 font-mono">IP</th>
                          <th className="py-2.5 px-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line/30">
                        {(settings?.security?.loginHistory || defaultSettings.security.loginHistory).map((log) => (
                          <tr key={log.id} className="hover:bg-surface2/30 transition-colors">
                            <td className="py-2.5 px-3 font-mono text-ink">{log.timestamp}</td>
                            <td className="py-2.5 px-3 text-muted">{log.device}</td>
                            <td className="py-2.5 px-3 text-muted">{log.location}</td>
                            <td className="py-2.5 px-3 font-mono text-muted">{log.ip}</td>
                            <td className="py-2.5 px-3 text-right">
                              <StatusPill
                                status={log.status === 'Success' ? 'approved' : 'rejected'}
                                text={log.status}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* 5.2 NOTIFICATIONS SECTION */}
            {/* ---------------------------------------------------- */}
            {activeSection === 'notif' && (
              <div className="flex flex-col gap-6 w-full">
                {/* Preference Matrix */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[13px] font-display font-bold text-ink">
                      Notification channels by category
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onSendTestNotification?.();
                        onTriggerToast?.('Test notification delivered to drawer.');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-surface2 text-muted hover:text-ink border border-line text-[12px] font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Send size={13} className="text-accent" />
                      <span>Send test notification</span>
                    </button>
                  </div>
                  <PreferenceMatrix
                    matrix={notifState.preferenceMatrix}
                    onChange={(updated) => setNotifState((prev) => ({ ...prev, preferenceMatrix: updated }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email Digest */}
                  <div className="p-4 rounded-xl bg-surface/40 border border-line flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-ink font-display" htmlFor="emailDigest">
                      Executive email digest
                    </label>
                    <p className="text-[12px] text-muted">
                      Receive an aggregated email summary of pending manager actions and team roster highlights.
                    </p>
                    <select
                      id="emailDigest"
                      value={notifState.emailDigest}
                      onChange={(e) => setNotifState((prev) => ({ ...prev, emailDigest: e.target.value }))}
                      className="mt-1 w-full bg-surface2 border border-line rounded-xl px-3 py-2 text-[12.5px] text-ink focus:outline-none focus:border-accent"
                    >
                      <option value="Instant">Instant (per notification)</option>
                      <option value="Daily at 9:00 AM">Daily at 9:00 AM IST</option>
                      <option value="Weekly on Monday">Weekly on Monday at 9:00 AM IST</option>
                    </select>
                  </div>

                  {/* Approval Reminders */}
                  <div className="p-4 rounded-xl bg-surface/40 border border-line flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-ink font-display" htmlFor="remindApprovals">
                      Pending approval reminders
                    </label>
                    <p className="text-[12px] text-muted">
                      Frequency to ping you when team leave, attendance, or reimbursement requests remain pending.
                    </p>
                    <select
                      id="remindApprovals"
                      value={notifState.remindApprovalsEvery}
                      onChange={(e) => setNotifState((prev) => ({ ...prev, remindApprovalsEvery: e.target.value }))}
                      className="mt-1 w-full bg-surface2 border border-line rounded-xl px-3 py-2 text-[12.5px] text-ink focus:outline-none focus:border-accent"
                    >
                      <option value="4 hours">Every 4 hours</option>
                      <option value="Daily">Daily summary</option>
                      <option value="Off">Off (no auto-reminders)</option>
                    </select>
                  </div>
                </div>

                {/* Quiet Hours Card */}
                <div className="p-4 rounded-xl bg-surface/40 border border-line flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-accent" />
                      <span className="font-display font-bold text-[13.5px] text-ink">
                        Quiet hours
                      </span>
                    </div>
                    <Switch
                      checked={notifState.quietHoursEnabled}
                      onChange={(val) => setNotifState((prev) => ({ ...prev, quietHoursEnabled: val }))}
                      aria-label="Toggle quiet hours"
                    />
                  </div>

                  <p className="text-[12px] text-muted">
                    Mute sound and banner alerts outside of standard working hours.
                  </p>

                  <div className="flex items-center gap-4 flex-wrap pt-1">
                    <div className="flex items-center gap-2">
                      <label htmlFor="quietFrom" className="text-[12px] font-semibold text-muted">From:</label>
                      <input
                        id="quietFrom"
                        type="time"
                        value={notifState.quietHoursFrom}
                        disabled={!notifState.quietHoursEnabled}
                        onChange={(e) => setNotifState((prev) => ({ ...prev, quietHoursFrom: e.target.value }))}
                        className="bg-surface2 border border-line rounded-lg px-2.5 py-1 text-[12px] text-ink focus:outline-none focus:border-accent disabled:opacity-40"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label htmlFor="quietTo" className="text-[12px] font-semibold text-muted">To:</label>
                      <input
                        id="quietTo"
                        type="time"
                        value={notifState.quietHoursTo}
                        disabled={!notifState.quietHoursEnabled}
                        onChange={(e) => setNotifState((prev) => ({ ...prev, quietHoursTo: e.target.value }))}
                        className="bg-surface2 border border-line rounded-lg px-2.5 py-1 text-[12px] text-ink focus:outline-none focus:border-accent disabled:opacity-40"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-[12px] text-ink select-none cursor-pointer ml-auto">
                      <input
                        type="checkbox"
                        checked={notifState.allowUrgentApprovals}
                        disabled={!notifState.quietHoursEnabled}
                        onChange={(e) => setNotifState((prev) => ({ ...prev, allowUrgentApprovals: e.target.checked }))}
                        className="rounded border-line bg-surface2 text-accent focus:ring-accent"
                      />
                      <span>Allow urgent approvals to break through</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* 5.3 PREFERENCES SECTION */}
            {/* ---------------------------------------------------- */}
            {activeSection === 'prefs' && (
              <div className="flex flex-col gap-6 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Language */}
                  <div className="p-4 rounded-xl bg-surface/40 border border-line flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-ink font-display" htmlFor="language">
                      Interface language
                    </label>
                    <select
                      id="language"
                      value={prefsState.language}
                      onChange={(e) => setPrefsState((prev) => ({ ...prev, language: e.target.value }))}
                      className="w-full bg-surface2 border border-line rounded-xl px-3 py-2 text-[12.5px] text-ink focus:outline-none focus:border-accent"
                    >
                      <option value="English">English (India)</option>
                      <option value="Hindi" disabled>Hindi · Coming soon</option>
                      <option value="Telugu" disabled>Telugu · Coming soon</option>
                    </select>
                    <div className="flex gap-2 pt-1">
                      <Tag tone="accent">English Active</Tag>
                      <span className="text-[11px] text-muted flex items-center">Hindi & Telugu regional packs coming soon</span>
                    </div>
                  </div>

                  {/* Time Zone (Locked) */}
                  <div className="p-4 rounded-xl bg-surface/40 border border-line flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[13px] font-bold text-ink font-display" htmlFor="timeZone">
                        System time zone
                      </label>
                      <span className="flex items-center gap-1 text-[11px] text-muted">
                        <Lock size={11} /> Locked to work location
                      </span>
                    </div>
                    <input
                      id="timeZone"
                      type="text"
                      readOnly
                      value={prefsState.timeZone}
                      className="w-full bg-surface2/50 border border-line rounded-xl px-3 py-2 text-[12.5px] text-muted cursor-not-allowed font-mono"
                    />
                    <span className="text-[11px] text-muted">India Standard Time (UTC+5:30) applies to all roster and punch calculations.</span>
                  </div>

                  {/* Date Format */}
                  <div className="p-4 rounded-xl bg-surface/40 border border-line flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-ink font-display" htmlFor="dateFormat">
                      Date format
                    </label>
                    <select
                      id="dateFormat"
                      value={prefsState.dateFormat}
                      onChange={(e) => setPrefsState((prev) => ({ ...prev, dateFormat: e.target.value }))}
                      className="w-full bg-surface2 border border-line rounded-xl px-3 py-2 text-[12.5px] text-ink focus:outline-none focus:border-accent"
                    >
                      <option value="6 Nov 2026">6 Nov 2026 (DD Mon YYYY)</option>
                      <option value="06/11/2026">06/11/2026 (DD/MM/YYYY)</option>
                      <option value="2026-11-06">2026-11-06 (ISO YYYY-MM-DD)</option>
                    </select>
                    <span className="text-[11px] text-muted">Applied across leave logs, shifts and export tables.</span>
                  </div>

                  {/* Number Format */}
                  <div className="p-4 rounded-xl bg-surface/40 border border-line flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-ink font-display" htmlFor="numberFormat">
                      Number & Currency formatting
                    </label>
                    <select
                      id="numberFormat"
                      value={prefsState.numberFormat}
                      onChange={(e) => setPrefsState((prev) => ({ ...prev, numberFormat: e.target.value }))}
                      className="w-full bg-surface2 border border-line rounded-xl px-3 py-2 text-[12.5px] text-ink focus:outline-none focus:border-accent"
                    >
                      <option value="Indian lakh/crore">Indian lakh / crore (₹ 12,50,000)</option>
                      <option value="International">International (₹ 1,250,000)</option>
                    </select>
                    <span className="text-[11px] text-muted">Determines thousand separator grouping in payroll analytics.</span>
                  </div>

                  {/* Week Starts On */}
                  <div className="p-4 rounded-xl bg-surface/40 border border-line flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-ink font-display" htmlFor="weekStartsOn">
                      Week starts on
                    </label>
                    <select
                      id="weekStartsOn"
                      value={prefsState.weekStartsOn}
                      onChange={(e) => setPrefsState((prev) => ({ ...prev, weekStartsOn: e.target.value }))}
                      className="w-full bg-surface2 border border-line rounded-xl px-3 py-2 text-[12.5px] text-ink focus:outline-none focus:border-accent"
                    >
                      <option value="Monday">Monday (Standard Indian Workweek)</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </div>

                  {/* Default Landing Page */}
                  <div className="p-4 rounded-xl bg-surface/40 border border-line flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-ink font-display" htmlFor="defaultLanding">
                      Default landing page
                    </label>
                    <select
                      id="defaultLanding"
                      value={prefsState.defaultLandingPage}
                      onChange={(e) => setPrefsState((prev) => ({ ...prev, defaultLandingPage: e.target.value }))}
                      className="w-full bg-surface2 border border-line rounded-xl px-3 py-2 text-[12.5px] text-ink focus:outline-none focus:border-accent"
                    >
                      <option value="Overview">Overview (/dashboard)</option>
                      <option value="Leave Requests">Leave Requests (/dashboard/leave)</option>
                      <option value="Attendance">Attendance (/dashboard/attendance)</option>
                      <option value="Performance">Performance (/dashboard/performance)</option>
                    </select>
                  </div>
                </div>

                {/* Display Density & Motion */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-surface/40 border border-line flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-display font-bold text-[13.5px] text-ink">
                        Display density
                      </span>
                      <span className="text-[12px] text-muted">
                        Switches component paddings between Comfortable (20px) and Compact (12px).
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-surface2 p-1 rounded-xl border border-line text-[12px]">
                      <button
                        type="button"
                        onClick={() => setPrefsState((prev) => ({ ...prev, displayDensity: 'Comfortable' }))}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                          prefsState.displayDensity === 'Comfortable'
                            ? 'bg-accent text-on-accent font-bold'
                            : 'text-muted hover:text-ink'
                        }`}
                      >
                        Comfortable
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrefsState((prev) => ({ ...prev, displayDensity: 'Compact' }))}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                          prefsState.displayDensity === 'Compact'
                            ? 'bg-accent text-on-accent font-bold'
                            : 'text-muted hover:text-ink'
                        }`}
                      >
                        Compact
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface/40 border border-line flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-display font-bold text-[13.5px] text-ink">
                        Reduce motion
                      </span>
                      <span className="text-[12px] text-muted">
                        Disable interface slide-in and pulse animations.
                      </span>
                    </div>
                    <Switch
                      checked={prefsState.reduceMotion}
                      onChange={(val) => setPrefsState((prev) => ({ ...prev, reduceMotion: val }))}
                      aria-label="Toggle reduced motion"
                    />
                  </div>
                </div>

                {/* Read-only Theme Row */}
                <div className="p-4 rounded-xl bg-surface/40 border border-line flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-display font-bold text-[13.5px] text-ink">
                      Theme
                    </span>
                    <span className="text-[12px] text-muted">
                      MONSOON GLASS Design System (Dark Only)
                    </span>
                  </div>
                  <Tag tone="accent">Light mode is not available</Tag>
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* 5.4 APPROVALS & DELEGATION SECTION */}
            {/* ---------------------------------------------------- */}
            {activeSection === 'approve' && (
              <div className="flex flex-col gap-6 w-full">
                {/* Active Status Banner if delegation is on */}
                {approveState.active && (
                  <div className="p-4 rounded-xl bg-accent/15 border border-accent/40 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
                      <div className="flex flex-col">
                        <span className="font-display font-bold text-[13.5px] text-ink">
                          Active Delegation: {approveState.delegatePersonName}
                        </span>
                        <span className="text-[12px] text-muted">
                          Managing approvals from {approveState.fromDate} to {approveState.toDate} · Scopes: {approveState.scopes.join(', ')}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleEndDelegation}
                      className="px-3 py-1.5 rounded-xl bg-surface2 text-bad border border-bad/30 hover:bg-bad/10 text-[12px] font-semibold transition-colors"
                    >
                      End delegation
                    </button>
                  </div>
                )}

                {/* Delegate Approvals Card */}
                <div className="p-4 rounded-xl bg-surface/40 border border-line flex flex-col gap-4">
                  <span className="font-display font-bold text-[14px] text-ink">
                    Delegate pending approvals
                  </span>
                  <p className="text-[12px] text-muted max-w-[65ch]">
                    Temporarily assign your approval authorities to another engineering lead or director during planned leaves or travel.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Delegate Person Select */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="delegatePerson" className="text-[12px] font-semibold text-muted">
                        Delegate to peer / director
                      </label>
                      <select
                        id="delegatePerson"
                        value={approveState.delegatePersonId}
                        onChange={(e) => {
                          const id = e.target.value;
                          const name = e.target.options[e.target.selectedIndex].text;
                          setApproveState((prev) => ({ ...prev, delegatePersonId: id, delegatePersonName: name }));
                        }}
                        className="w-full bg-surface2 border border-line rounded-xl px-3 py-2 text-[12.5px] text-ink focus:outline-none focus:border-accent"
                      >
                        <option value="EMP-005">Rohan Gupta (Engineering Lead)</option>
                        <option value="EMP-012">Vikram Malhotra (Staff Architect)</option>
                        <option value="EMP-018">Sneha Reddy (Senior Lead)</option>
                        <option value="EMP-DIR">Rahul Menon (Director, Engineering)</option>
                      </select>
                    </div>

                    {/* From Date */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="fromDate" className="text-[12px] font-semibold text-muted">From date</label>
                      <input
                        id="fromDate"
                        type="text"
                        value={approveState.fromDate}
                        onChange={(e) => setApproveState((prev) => ({ ...prev, fromDate: e.target.value }))}
                        className="w-full bg-surface2 border border-line rounded-xl px-3 py-2 text-[12.5px] text-ink focus:outline-none focus:border-accent"
                        placeholder="10 Nov 2026"
                      />
                    </div>

                    {/* To Date */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="toDate" className="text-[12px] font-semibold text-muted">To date</label>
                      <input
                        id="toDate"
                        type="text"
                        value={approveState.toDate}
                        onChange={(e) => setApproveState((prev) => ({ ...prev, toDate: e.target.value }))}
                        className="w-full bg-surface2 border border-line rounded-xl px-3 py-2 text-[12.5px] text-ink focus:outline-none focus:border-accent"
                        placeholder="14 Nov 2026"
                      />
                    </div>
                  </div>

                  {/* Scopes Checkboxes */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="text-[12px] font-semibold text-muted">Delegated categories</span>
                    <div className="flex items-center gap-4 flex-wrap">
                      {['Leave', 'Regularisation', 'Overtime', 'Expenses'].map((scope) => {
                        const isChecked = approveState.scopes.includes(scope);
                        return (
                          <label key={scope} className="flex items-center gap-2 text-[12.5px] text-ink cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const nextScopes = e.target.checked
                                  ? [...approveState.scopes, scope]
                                  : approveState.scopes.filter((s) => s !== scope);
                                setApproveState((prev) => ({ ...prev, scopes: nextScopes }));
                              }}
                              className="rounded border-line bg-surface2 text-accent focus:ring-accent"
                            />
                            <span>{scope}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {!approveState.active && (
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleStartDelegation}
                        className="px-4 py-2 rounded-xl font-display font-bold text-[12.5px] transition-all shadow-sm"
                        style={{
                          backgroundColor: 'var(--accent)',
                          color: 'var(--on-accent)',
                          borderRadius: 'var(--radius)',
                        }}
                      >
                        Start delegation
                      </button>
                    </div>
                  )}
                </div>

                {/* Escalation & Auto-reminders */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-surface/40 border border-line flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-ink font-display" htmlFor="escalateAfter">
                      Auto-escalate pending approvals
                    </label>
                    <p className="text-[12px] text-muted">
                      Automatically escalate requests if untouched after:
                    </p>
                    <select
                      id="escalateAfter"
                      value={approveState.escalateAfter}
                      onChange={(e) => setApproveState((prev) => ({ ...prev, escalateAfter: e.target.value }))}
                      className="w-full bg-surface2 border border-line rounded-xl px-3 py-2 text-[12.5px] text-ink focus:outline-none focus:border-accent"
                    >
                      <option value="2 days">2 days (Recommended)</option>
                      <option value="3 days">3 days</option>
                      <option value="Off">Off</option>
                    </select>
                  </div>

                  <div className="p-4 rounded-xl bg-surface/40 border border-line flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-ink font-display" htmlFor="escalateTo">
                      Escalate to supervisor
                    </label>
                    <input
                      id="escalateTo"
                      type="text"
                      readOnly
                      value={approveState.escalateTo}
                      className="w-full bg-surface2/50 border border-line rounded-xl px-3 py-2 text-[12.5px] text-muted cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Out of Office Switch & Message */}
                <div className="p-4 rounded-xl bg-surface/40 border border-line flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} className="text-accent" />
                      <span className="font-display font-bold text-[13.5px] text-ink">
                        Out of office notice
                      </span>
                    </div>
                    <Switch
                      checked={approveState.outOfOfficeEnabled}
                      onChange={(val) => setApproveState((prev) => ({ ...prev, outOfOfficeEnabled: val }))}
                      aria-label="Toggle Out of office notice"
                    />
                  </div>

                  <p className="text-[12px] text-muted">
                    When enabled, shows a muted banner on your Overview page reminding you and peers of your absence.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="oooFrom" className="text-[12px] font-semibold text-muted">From</label>
                      <input
                        id="oooFrom"
                        type="text"
                        value={approveState.outOfOfficeFrom}
                        disabled={!approveState.outOfOfficeEnabled}
                        onChange={(e) => setApproveState((prev) => ({ ...prev, outOfOfficeFrom: e.target.value }))}
                        className="bg-surface2 border border-line rounded-xl px-3 py-1.5 text-[12.5px] text-ink disabled:opacity-40"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="oooTo" className="text-[12px] font-semibold text-muted">To</label>
                      <input
                        id="oooTo"
                        type="text"
                        value={approveState.outOfOfficeTo}
                        disabled={!approveState.outOfOfficeEnabled}
                        onChange={(e) => setApproveState((prev) => ({ ...prev, outOfOfficeTo: e.target.value }))}
                        className="bg-surface2 border border-line rounded-xl px-3 py-1.5 text-[12.5px] text-ink disabled:opacity-40"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="oooMessage" className="text-[12px] font-semibold text-muted">Out of office message</label>
                    <textarea
                      id="oooMessage"
                      rows={2}
                      value={approveState.outOfOfficeMessage}
                      disabled={!approveState.outOfOfficeEnabled}
                      onChange={(e) => setApproveState((prev) => ({ ...prev, outOfOfficeMessage: e.target.value }))}
                      className="bg-surface2 border border-line rounded-xl p-3 text-[12.5px] text-ink focus:outline-none focus:border-accent disabled:opacity-40"
                    />
                  </div>
                </div>

                {/* Default Approval Comments (Chips) */}
                <div className="p-4 rounded-xl bg-surface/40 border border-line flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-[13.5px] text-ink">
                      Default approval quick replies (Up to 5)
                    </span>
                    <span className="text-[11px] text-muted font-mono">
                      {approveState.quickReplies.length}/5 chips
                    </span>
                  </div>

                  <p className="text-[12px] text-muted">
                    Preset comments inserted into the approval modal notes with a single click.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {approveState.quickReplies.map((reply, idx) => (
                      <span
                        key={idx}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface2 border border-line text-[12px] text-ink"
                      >
                        <span>{reply}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuickReply(idx)}
                          className="text-muted hover:text-bad transition-colors"
                          title="Remove comment chip"
                        >
                          <Trash2 size={12} />
                        </button>
                      </span>
                    ))}
                  </div>

                  {approveState.quickReplies.length < 5 && (
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={newQuickReply}
                        onChange={(e) => setNewQuickReply(e.target.value)}
                        placeholder="Add quick reply phrase..."
                        className="flex-1 bg-surface2 border border-line rounded-xl px-3 py-1.5 text-[12.5px] text-ink focus:outline-none focus:border-accent"
                      />
                      <button
                        type="button"
                        onClick={handleAddQuickReply}
                        className="px-3 py-1.5 rounded-xl bg-surface2 text-accent border border-line hover:border-accent text-[12px] font-semibold transition-colors flex items-center gap-1"
                      >
                        <Plus size={13} />
                        <span>Add chip</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* 5.5 CALENDAR & INTEGRATIONS SECTION */}
            {/* ---------------------------------------------------- */}
            {activeSection === 'integr' && (
              <div className="flex flex-col gap-6 w-full">
                <div className="p-3.5 rounded-xl bg-surface2/60 border border-line text-[12px] text-muted flex items-start gap-2.5">
                  <Info size={16} className="text-accent shrink-0 mt-0.5" />
                  <span>
                    Calendar and communication integrations synchronize meeting schedules and 1:1 check-ins. HR payroll, tax identifiers, and statutory records are strictly isolated and never shared with external APIs.
                  </span>
                </div>

                {/* 4 Sample Integration Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Google Calendar */}
                  <div className="p-4 rounded-xl bg-surface/40 border border-line flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="font-display font-bold text-[14px] text-ink">
                        Google Calendar
                      </span>
                      <span className="text-[12px] text-muted">
                        Syncs 1:1 meetings and team review slots
                      </span>
                      <div className="pt-1">
                        <StatusPill
                          status={integrState.googleCalendar ? 'approved' : 'rejected'}
                          text={integrState.googleCalendar ? 'Connected' : 'Not connected'}
                        />
                      </div>
                    </div>
                    <Switch
                      checked={integrState.googleCalendar}
                      onChange={(val) => {
                        setIntegrState((prev) => ({ ...prev, googleCalendar: val }));
                        onTriggerToast?.(val ? 'Google Calendar connected (sample).' : 'Google Calendar disconnected.');
                      }}
                      aria-label="Toggle Google Calendar"
                    />
                  </div>

                  {/* Outlook Calendar */}
                  <div className="p-4 rounded-xl bg-surface/40 border border-line flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="font-display font-bold text-[14px] text-ink">
                        Outlook Calendar
                      </span>
                      <span className="text-[12px] text-muted">
                        Microsoft 365 calendar synchronization
                      </span>
                      <div className="pt-1">
                        <StatusPill
                          status={integrState.outlookCalendar ? 'approved' : 'rejected'}
                          text={integrState.outlookCalendar ? 'Connected' : 'Not connected'}
                        />
                      </div>
                    </div>
                    <Switch
                      checked={integrState.outlookCalendar}
                      onChange={(val) => {
                        setIntegrState((prev) => ({ ...prev, outlookCalendar: val }));
                        onTriggerToast?.(val ? 'Outlook Calendar connected (sample).' : 'Outlook Calendar disconnected.');
                      }}
                      aria-label="Toggle Outlook Calendar"
                    />
                  </div>

                  {/* Microsoft Teams */}
                  <div className="p-4 rounded-xl bg-surface/40 border border-line flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="font-display font-bold text-[14px] text-ink">
                        Microsoft Teams
                      </span>
                      <span className="text-[12px] text-muted">
                        Direct notification bots for urgent approvals
                      </span>
                      <div className="pt-1">
                        <StatusPill
                          status={integrState.microsoftTeams ? 'approved' : 'rejected'}
                          text={integrState.microsoftTeams ? 'Connected' : 'Not connected'}
                        />
                      </div>
                    </div>
                    <Switch
                      checked={integrState.microsoftTeams}
                      onChange={(val) => {
                        setIntegrState((prev) => ({ ...prev, microsoftTeams: val }));
                        onTriggerToast?.(val ? 'Microsoft Teams connected (sample).' : 'Microsoft Teams disconnected.');
                      }}
                      aria-label="Toggle Microsoft Teams"
                    />
                  </div>

                  {/* Slack */}
                  <div className="p-4 rounded-xl bg-surface/40 border border-line flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="font-display font-bold text-[14px] text-ink">
                        Slack
                      </span>
                      <span className="text-[12px] text-muted">
                        Broadcast shift reminders & OKR check-ins
                      </span>
                      <div className="pt-1">
                        <StatusPill
                          status={integrState.slack ? 'approved' : 'rejected'}
                          text={integrState.slack ? 'Connected' : 'Not connected'}
                        />
                      </div>
                    </div>
                    <Switch
                      checked={integrState.slack}
                      onChange={(val) => {
                        setIntegrState((prev) => ({ ...prev, slack: val }));
                        onTriggerToast?.(val ? 'Slack connected (sample).' : 'Slack disconnected.');
                      }}
                      aria-label="Toggle Slack"
                    />
                  </div>
                </div>

                {/* Auto add meetings switch */}
                <div className="p-4 rounded-xl bg-surface/40 border border-line flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-display font-bold text-[13.5px] text-ink">
                      Add meetings to my calendar automatically
                    </span>
                    <span className="text-[12px] text-muted">
                      Generate Google / Outlook invite links whenever a 1:1 or sprint review meeting is confirmed.
                    </span>
                  </div>
                  <Switch
                    checked={integrState.autoAddMeetings}
                    onChange={(val) => setIntegrState((prev) => ({ ...prev, autoAddMeetings: val }))}
                    aria-label="Toggle auto-add meetings to calendar"
                  />
                </div>
              </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* 5.6 PRIVACY & DATA SECTION */}
            {/* ---------------------------------------------------- */}
            {activeSection === 'privacy' && (
              <div className="flex flex-col gap-6 w-full">
                {/* Profile Visibility to Team */}
                <div className="flex flex-col gap-3">
                  <span className="font-display font-bold text-[14px] text-ink">
                    Team profile visibility
                  </span>
                  <p className="text-[12px] text-muted">
                    Configure which non-essential personal identifiers direct and indirect reports can view in the organization directory.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-surface/40 border border-line flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[13px] font-semibold text-ink">Show mobile number</span>
                        <span className="text-[11.5px] text-muted">Visible on manager profile card</span>
                      </div>
                      <Switch
                        checked={privacyState.showMobileNumber}
                        onChange={(val) => setPrivacyState((prev) => ({ ...prev, showMobileNumber: val }))}
                        aria-label="Toggle show mobile number"
                      />
                    </div>

                    <div className="p-4 rounded-xl bg-surface/40 border border-line flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[13px] font-semibold text-ink">Show personal email</span>
                        <span className="text-[11.5px] text-muted">Secondary backup email address</span>
                      </div>
                      <Switch
                        checked={privacyState.showPersonalEmail}
                        onChange={(val) => setPrivacyState((prev) => ({ ...prev, showPersonalEmail: val }))}
                        aria-label="Toggle show personal email"
                      />
                    </div>

                    <div className="p-4 rounded-xl bg-surface/40 border border-line flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[13px] font-semibold text-ink">Show birthday on calendar</span>
                        <span className="text-[11.5px] text-muted">Celebrated in announcements stream</span>
                      </div>
                      <Switch
                        checked={privacyState.showBirthdayCalendar}
                        onChange={(val) => setPrivacyState((prev) => ({ ...prev, showBirthdayCalendar: val }))}
                        aria-label="Toggle show birthday"
                      />
                    </div>

                    <div className="p-4 rounded-xl bg-surface/40 border border-line flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[13px] font-semibold text-ink">Show work anniversary</span>
                        <span className="text-[11.5px] text-muted">Milestone badge on team dashboard</span>
                      </div>
                      <Switch
                        checked={privacyState.showWorkAnniversary}
                        onChange={(val) => setPrivacyState((prev) => ({ ...prev, showWorkAnniversary: val }))}
                        aria-label="Toggle show work anniversary"
                      />
                    </div>
                  </div>
                </div>

                {/* Download My Data Card */}
                <div className="p-4 rounded-xl bg-surface/40 border border-line flex flex-col gap-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-display font-bold text-[14px] text-ink">
                        Download my managerial data archive
                      </span>
                      <span className="text-[12px] text-muted">
                        Export an encrypted machine-readable archive of your approvals history, 1:1 notes, and audit logs.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleTriggerDataExport}
                      className="px-3.5 py-2 rounded-xl bg-surface2 text-ink border border-line hover:border-accent text-[12px] font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Download size={14} className="text-accent" />
                      <span>Download my data</span>
                    </button>
                  </div>

                  {/* Past Exports Table */}
                  <div className="overflow-x-auto w-full rounded-xl border border-line/60 bg-surface/30 mt-2">
                    <table className="w-full border-collapse text-left min-w-[500px] text-[12px]">
                      <thead>
                        <tr className="border-b border-line bg-surface2/50 text-[10.5px] font-bold uppercase tracking-wider text-muted font-mono">
                          <th className="py-2.5 px-3">Export ID</th>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Archive Type</th>
                          <th className="py-2.5 px-3 font-mono">Size</th>
                          <th className="py-2.5 px-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line/30">
                        {privacyState.exportsHistory.map((exp) => (
                          <tr key={exp.id} className="hover:bg-surface2/30 transition-colors">
                            <td className="py-2.5 px-3 font-mono text-ink font-semibold">{exp.id}</td>
                            <td className="py-2.5 px-3 text-muted">{exp.date}</td>
                            <td className="py-2.5 px-3 text-ink">{exp.type}</td>
                            <td className="py-2.5 px-3 font-mono text-muted">{exp.size}</td>
                            <td className="py-2.5 px-3 text-right">
                              <StatusPill
                                status={exp.status === 'Completed' ? 'approved' : 'pending'}
                                text={exp.status}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Danger Area Card (bad-coloured border, 1px, no glow) */}
                <div className="p-4 rounded-xl bg-surface/40 border border-bad/40 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-display font-bold text-[14px] text-bad flex items-center gap-2">
                      <AlertTriangle size={15} />
                      Danger Area
                    </span>
                    <span className="text-[12px] text-muted max-w-[60ch]">
                      Request deactivation of your managerial account. Requires verification and manual sign-off by HR Operations.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDeactivateReason('');
                      setDeactivateUnderstood(false);
                      setIsDeactivateDrawerOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-bad/10 text-bad border border-bad/30 hover:bg-bad/20 text-[12px] font-semibold transition-colors"
                  >
                    Request account deactivation
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 2FA SETUP DRAWER */}
      {/* ==================================================== */}
      <Drawer
        isOpen={is2FADrawerOpen}
        onClose={() => setIs2FADrawerOpen(false)}
        title="Setup Two-Step Verification"
        width="440px"
      >
        <form onSubmit={handleConfirm2FA} className="flex flex-col gap-5 text-[13px]">
          <p className="text-muted leading-relaxed">
            Scan the QR code in your authenticator app or enter the 6-digit verification code below to verify your device.
          </p>

          <div className="p-3.5 rounded-xl bg-surface2/60 border border-line text-center">
            <span className="text-[11px] font-mono text-muted uppercase tracking-wider block mb-1">
              Sample Verification Code
            </span>
            <span className="font-mono font-bold text-accent text-[20px] tracking-widest">
              123456
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="twoFactorCode" className="font-semibold text-ink">
              Enter 6-digit code
            </label>
            <input
              id="twoFactorCode"
              type="text"
              maxLength={6}
              value={twoFactorCode}
              onChange={(e) => {
                setTwoFactorCode(e.target.value);
                setTwoFactorError('');
              }}
              placeholder="123456"
              className="bg-surface2 border border-line rounded-xl px-3 py-2 text-center font-mono text-[16px] tracking-widest text-ink focus:outline-none focus:border-accent"
            />
            {twoFactorError && (
              <span className="text-[11px] text-bad">{twoFactorError}</span>
            )}
          </div>

          {/* Backup Codes */}
          <div className="flex flex-col gap-2 pt-2 border-t border-line">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink text-[12px]">Backup Recovery Codes</span>
              <button
                type="button"
                onClick={handleCopyBackupCodes}
                className="text-accent hover:underline text-[11.5px] font-semibold flex items-center gap-1"
              >
                {copiedCodes ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedCodes ? 'Copied' : 'Copy all'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 p-3 rounded-xl bg-surface/50 border border-line font-mono text-[11px] text-muted">
              {(settings?.security?.backupCodes || defaultSettings.security.backupCodes).map((code) => (
                <span key={code}>{code}</span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <button
              type="button"
              onClick={() => setIs2FADrawerOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface2 text-muted hover:text-ink text-[12.5px] font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl font-display font-bold text-[12.5px]"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--on-accent)',
                borderRadius: 'var(--radius)',
              }}
            >
              Verify and enable
            </button>
          </div>
        </form>
      </Drawer>

      {/* ==================================================== */}
      {/* ACCOUNT DEACTIVATION DRAWER */}
      {/* ==================================================== */}
      <Drawer
        isOpen={isDeactivateDrawerOpen}
        onClose={() => setIsDeactivateDrawerOpen(false)}
        title="Request Account Deactivation"
        width="440px"
      >
        <form onSubmit={handleDeactivateAccount} className="flex flex-col gap-4 text-[13px]">
          <div className="p-3.5 rounded-xl bg-bad/10 border border-bad/30 text-bad text-[12px] flex items-start gap-2.5">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>
              Account deactivation will immediately revoke your managerial approvals access and trigger an organizational reassignment workflow for your 24 team members.
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="deactReason" className="font-semibold text-ink">
              Reason for deactivation request <span className="text-bad">*</span>
            </label>
            <textarea
              id="deactReason"
              required
              rows={3}
              value={deactivateReason}
              onChange={(e) => setDeactivateReason(e.target.value)}
              placeholder="e.g., Transitioning to non-managerial consulting role..."
              className="bg-surface2 border border-line rounded-xl p-3 text-[12.5px] text-ink focus:outline-none focus:border-accent"
            />
          </div>

          <label className="flex items-start gap-2.5 text-[12px] text-ink cursor-pointer pt-1 select-none">
            <input
              type="checkbox"
              checked={deactivateUnderstood}
              onChange={(e) => setDeactivateUnderstood(e.target.checked)}
              className="rounded border-line bg-surface2 text-accent focus:ring-accent mt-0.5"
            />
            <span>I understand HR Operations will review this request and contact me via registered work email.</span>
          </label>

          <div className="flex justify-end gap-2 pt-4 border-t border-line">
            <button
              type="button"
              onClick={() => setIsDeactivateDrawerOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface2 text-muted hover:text-ink text-[12.5px] font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!deactivateUnderstood || !deactivateReason.trim() || isSubmittingDeactivation}
              className="px-4 py-2 rounded-xl bg-bad text-white font-display font-bold text-[12.5px] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              {isSubmittingDeactivation ? 'Submitting…' : 'Submit deactivation request'}
            </button>
          </div>
        </form>
      </Drawer>

      {/* ==================================================== */}
      {/* UNSAVED CHANGES CONFIRMATION DRAWER */}
      {/* ==================================================== */}
      <Drawer
        isOpen={isUnsavedDrawerOpen}
        onClose={() => setIsUnsavedDrawerOpen(false)}
        title="Unsaved Changes"
        width="380px"
      >
        <div className="flex flex-col gap-4 text-[13px]">
          <p className="text-muted">
            You have unsaved changes in this settings section. If you switch sections now, your changes will be discarded.
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <button
              type="button"
              onClick={() => setIsUnsavedDrawerOpen(false)}
              className="px-4 py-2 rounded-xl bg-surface2 text-ink text-[12.5px] font-semibold"
            >
              Keep editing
            </button>
            <button
              type="button"
              onClick={() => {
                setIsUnsavedDrawerOpen(false);
                handleResetSection();
                if (pendingSection) {
                  navigateSection(pendingSection, true);
                  setPendingSection(null);
                }
              }}
              className="px-4 py-2 rounded-xl bg-bad/15 text-bad border border-bad/30 hover:bg-bad/25 text-[12.5px] font-semibold"
            >
              Discard and leave
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

