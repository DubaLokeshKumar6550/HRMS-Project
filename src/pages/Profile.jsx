import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Tag from '../components/Tag';
import StatusPill from '../components/StatusPill';
import Avatar from '../components/Avatar';
import SegBar from '../components/SegBar';
import FormField from '../components/FormField';
import Select from '../components/Select';
import Textarea from '../components/Textarea';
import ProfileHeader from '../components/ProfileHeader';
import PhotoUploader from '../components/PhotoUploader';
import ChangeRequestDrawer from '../components/ChangeRequestDrawer';
import CertificationDrawer from '../components/CertificationDrawer';
import { useAuth } from '../context/AuthContext';
import { INDIAN_STATES } from '../data/profile';
import {
  User,
  Briefcase,
  Users,
  Award,
  Activity,
  Lock,
  Plus,
  Trash2,
  ExternalLink,
  Save,
  RotateCcw,
  AlertCircle,
  Eye,
  Check,
  Clock,
  ArrowRight,
} from 'lucide-react';

const TABS = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'work', label: 'Work details', icon: Briefcase },
  { id: 'team', label: 'Team summary', icon: Users },
  { id: 'skills', label: 'Skills & Certifications', icon: Award },
  { id: 'activity', label: 'Activity log', icon: Activity },
];

export default function Profile({ onTriggerToast, onNavigate }) {
  const { user, updateUser, updatePhoto, removePhoto } = useAuth();

  // Sync tab with URL (?tab=personal)
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'personal';
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') !== activeTab) {
      params.set('tab', activeTab);
      window.history.replaceState(null, '', `?${params.toString()}`);
    }
  }, [activeTab]);

  // Photo Uploader Drawer
  const [isPhotoUploaderOpen, setIsPhotoUploaderOpen] = useState(false);

  // Change Request Drawer
  const [isChangeRequestOpen, setIsChangeRequestOpen] = useState(false);

  // Certification Drawer & View
  const [isCertDrawerOpen, setIsCertDrawerOpen] = useState(false);
  const [viewingCert, setViewingCert] = useState(null);

  // Personal Tab Form State
  const [personalForm, setPersonalForm] = useState({
    preferredName: user.preferredName || user.name || '',
    mobile: user.mobile || '',
    personalEmail: user.personalEmail || '',
    gender: user.gender || 'Female',
    bloodGroup: user.bloodGroup || 'B+',
    maritalStatus: user.maritalStatus || 'Married',
    currentAddress: user.currentAddress || '',
    city: user.city || '',
    state: user.state || 'Telangana',
    pinCode: user.pinCode || '',
    permanentAddress: user.permanentAddress || '',
    sameAddress: user.sameAddress !== undefined ? user.sameAddress : true,
    emergencyContacts: user.emergencyContacts || [],
  });

  const [formErrors, setFormErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Skills Tab Form State
  const [skillsList, setSkillsList] = useState(user.skills || []);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [certificationsList, setCertificationsList] = useState(user.certifications || []);

  // Activity Log Filter
  const [activityFilter, setActivityFilter] = useState('All');

  // Track dirty state
  const handleFieldChange = (key, val) => {
    setPersonalForm((prev) => {
      const next = { ...prev, [key]: val };
      setIsDirty(true);
      return next;
    });
  };

  // Toast Helper
  const notify = (msg, undoFn) => {
    if (onTriggerToast) onTriggerToast(msg, undoFn);
  };

  // Validate personal form
  const validateForm = () => {
    const errs = {};
    // Mobile: 10 digits starting with 6-9
    if (!/^[6-9]\d{9}$/.test(personalForm.mobile.trim())) {
      errs.mobile = 'Enter a valid 10-digit Indian mobile number starting with 6–9';
    }
    // Email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalForm.personalEmail.trim())) {
      errs.personalEmail = 'Enter a valid email address';
    }
    // PIN code: 6 digits
    if (!/^\d{6}$/.test(personalForm.pinCode.trim())) {
      errs.pinCode = 'Enter a valid 6-digit Indian PIN code';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Save personal changes
  const handleSavePersonal = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    const prev = { ...user };

    try {
      await updateUser({
        ...personalForm,
        permanentAddress: personalForm.sameAddress
          ? personalForm.currentAddress
          : personalForm.permanentAddress,
      });
      setIsDirty(false);
      notify('Profile updated successfully', () => updateUser(prev));
    } catch (e) {
      notify('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Discard changes
  const handleDiscardPersonal = () => {
    setPersonalForm({
      preferredName: user.preferredName || user.name || '',
      mobile: user.mobile || '',
      personalEmail: user.personalEmail || '',
      gender: user.gender || 'Female',
      bloodGroup: user.bloodGroup || 'B+',
      maritalStatus: user.maritalStatus || 'Married',
      currentAddress: user.currentAddress || '',
      city: user.city || '',
      state: user.state || 'Telangana',
      pinCode: user.pinCode || '',
      permanentAddress: user.permanentAddress || '',
      sameAddress: user.sameAddress !== undefined ? user.sameAddress : true,
      emergencyContacts: user.emergencyContacts || [],
    });
    setFormErrors({});
    setIsDirty(false);
  };

  // Emergency contact handlers
  const handleAddEmergencyContact = () => {
    if (personalForm.emergencyContacts.length >= 2) return;
    const nextContacts = [
      ...personalForm.emergencyContacts,
      {
        id: Date.now(),
        name: '',
        relationship: 'Parent',
        mobile: '',
        altMobile: '',
      },
    ];
    setPersonalForm({ ...personalForm, emergencyContacts: nextContacts });
    setIsDirty(true);
  };

  const handleUpdateContact = (id, key, val) => {
    const nextContacts = personalForm.emergencyContacts.map((c) =>
      c.id === id ? { ...c, [key]: val } : c
    );
    setPersonalForm({ ...personalForm, emergencyContacts: nextContacts });
    setIsDirty(true);
  };

  const handleRemoveContact = (id) => {
    const nextContacts = personalForm.emergencyContacts.filter((c) => c.id !== id);
    setPersonalForm({ ...personalForm, emergencyContacts: nextContacts });
    setIsDirty(true);
  };

  // Skills handlers
  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (trimmed && !skillsList.includes(trimmed)) {
      const updated = [...skillsList, trimmed];
      setSkillsList(updated);
      updateUser({ skills: updated });
      setNewSkillInput('');
      notify(`Added skill: ${trimmed}`);
    }
  };

  const handleRemoveSkill = (skill) => {
    const updated = skillsList.filter((s) => s !== skill);
    setSkillsList(updated);
    updateUser({ skills: updated });
    notify(`Removed skill: ${skill}`);
  };

  // Add certification
  const handleAddCertification = (newCert) => {
    const updated = [newCert, ...certificationsList];
    setCertificationsList(updated);
    updateUser({ certifications: updated });
    notify(`Added certification: ${newCert.name}`);
  };

  // Submit HR Change Request
  const handleSubmitChangeRequest = (req) => {
    const updatedRequests = [req, ...(user.changeRequests || [])];
    updateUser({ changeRequests: updatedRequests });
    notify(`Request sent to HR for ${req.field}`);
  };

  // Filter activity
  const filteredActivity = (user.activity || []).filter((act) => {
    if (activityFilter === 'All') return true;
    return act.type === activityFilter;
  });

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Subtitle Strip */}
      <div>
        <p className="text-[12.5px] text-muted">
          Manager identity, contact details, organizational records, and career credentials
        </p>
      </div>

      {/* 4.1 Profile Header Card (phead, spans 2) */}
      <ProfileHeader
        profile={user}
        onOpenPhotoUploader={() => setIsPhotoUploaderOpen(true)}
      />

      {/* Pill Tabs */}
      <div
        role="tablist"
        aria-label="Profile navigation tabs"
        className="flex items-center gap-2 border-b border-line/40 pb-2 overflow-x-auto"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all select-none whitespace-nowrap border ${
                isActive
                  ? 'bg-accent text-on-accent border-accent shadow-sm'
                  : 'bg-surface2 text-muted border-line hover:text-ink hover:border-line/80'
              }`}
            >
              <Icon size={15} strokeWidth={1.8} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 4.2 SUBVIEW: PERSONAL DETAILS */}
      {/* ======================================================== */}
      {activeTab === 'personal' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            id="ppersonal"
            title="Personal & Residential Details"
            subtitle="Editable contact and emergency records for communication"
            className="col-span-1 md:col-span-2"
          >
            <div className="flex flex-col gap-6">
              {/* Two-column field grid at >=640px */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Full Name (Official)" id="pf-fullname" hint="Change via HR request">
                  <input
                    id="pf-fullname"
                    type="text"
                    value={user.name}
                    disabled
                    className="w-full bg-surface2/60 text-muted text-[13px] px-3.5 py-2.5 rounded-xl border border-line cursor-not-allowed"
                  />
                </FormField>

                <FormField label="Preferred Name" id="pf-prefname">
                  <input
                    id="pf-prefname"
                    type="text"
                    value={personalForm.preferredName}
                    onChange={(e) => handleFieldChange('preferredName', e.target.value)}
                    placeholder="e.g. Priya"
                    className="w-full bg-surface2 text-ink text-[13px] px-3.5 py-2.5 rounded-xl border border-line focus:border-accent outline-none"
                  />
                </FormField>

                <FormField label="Mobile Number" id="pf-mobile" error={formErrors.mobile} required>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2.5 rounded-xl bg-surface2 border border-line text-[12px] font-mono text-muted select-none">
                      +91
                    </span>
                    <input
                      id="pf-mobile"
                      type="tel"
                      value={personalForm.mobile}
                      onChange={(e) => handleFieldChange('mobile', e.target.value)}
                      placeholder="98765 43210"
                      className="w-full bg-surface2 text-ink text-[13px] px-3.5 py-2.5 rounded-xl border border-line focus:border-accent outline-none font-mono"
                    />
                  </div>
                </FormField>

                <FormField label="Personal Email" id="pf-email" error={formErrors.personalEmail} required>
                  <input
                    id="pf-email"
                    type="email"
                    value={personalForm.personalEmail}
                    onChange={(e) => handleFieldChange('personalEmail', e.target.value)}
                    placeholder="priya.personal@example.com"
                    className="w-full bg-surface2 text-ink text-[13px] px-3.5 py-2.5 rounded-xl border border-line focus:border-accent outline-none"
                  />
                </FormField>

                <FormField label="Date of Birth (Official)" id="pf-dob" hint="Read-only">
                  <input
                    id="pf-dob"
                    type="text"
                    value={user.dateOfBirth}
                    disabled
                    className="w-full bg-surface2/60 text-muted text-[13px] px-3.5 py-2.5 rounded-xl border border-line cursor-not-allowed font-mono"
                  />
                </FormField>

                <FormField label="Blood Group" id="pf-blood">
                  <Select
                    id="pf-blood"
                    value={personalForm.bloodGroup}
                    onChange={(e) => handleFieldChange('bloodGroup', e.target.value)}
                    options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']}
                  />
                </FormField>

                <FormField label="Gender (Optional)" id="pf-gender">
                  <Select
                    id="pf-gender"
                    value={personalForm.gender}
                    onChange={(e) => handleFieldChange('gender', e.target.value)}
                    options={['Female', 'Male', 'Non-binary', 'Prefer not to say']}
                  />
                </FormField>

                <FormField label="Marital Status (Optional)" id="pf-marital">
                  <Select
                    id="pf-marital"
                    value={personalForm.maritalStatus}
                    onChange={(e) => handleFieldChange('maritalStatus', e.target.value)}
                    options={['Married', 'Single', 'Other', 'Prefer not to say']}
                  />
                </FormField>
              </div>

              {/* Address section */}
              <div className="flex flex-col gap-4 pt-4 border-t border-line/40">
                <span className="text-[12px] font-bold uppercase tracking-wider text-muted font-mono">
                  Residential Address
                </span>

                <FormField label="Current Street Address" id="pf-addr" required>
                  <Textarea
                    id="pf-addr"
                    value={personalForm.currentAddress}
                    onChange={(e) => handleFieldChange('currentAddress', e.target.value)}
                    placeholder="House/Flat number, building name, street, locality..."
                    rows={2}
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormField label="City" id="pf-city" required>
                    <input
                      id="pf-city"
                      type="text"
                      value={personalForm.city}
                      onChange={(e) => handleFieldChange('city', e.target.value)}
                      placeholder="e.g. Hyderabad"
                      className="w-full bg-surface2 text-ink text-[13px] px-3.5 py-2.5 rounded-xl border border-line focus:border-accent outline-none"
                    />
                  </FormField>

                  <FormField label="State" id="pf-state" required>
                    <Select
                      id="pf-state"
                      value={personalForm.state}
                      onChange={(e) => handleFieldChange('state', e.target.value)}
                      options={INDIAN_STATES}
                    />
                  </FormField>

                  <FormField label="PIN Code" id="pf-pincode" error={formErrors.pinCode} required>
                    <input
                      id="pf-pincode"
                      type="text"
                      maxLength={6}
                      value={personalForm.pinCode}
                      onChange={(e) => handleFieldChange('pinCode', e.target.value)}
                      placeholder="500081"
                      className="w-full bg-surface2 text-ink text-[13px] px-3.5 py-2.5 rounded-xl border border-line focus:border-accent outline-none font-mono"
                    />
                  </FormField>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={personalForm.sameAddress}
                    onChange={(e) => handleFieldChange('sameAddress', e.target.checked)}
                    className="rounded bg-surface2 border-line text-accent w-4 h-4"
                  />
                  <span className="text-[13px] font-medium text-ink">
                    Permanent address is the same as current address
                  </span>
                </label>

                {!personalForm.sameAddress && (
                  <FormField label="Permanent Address" id="pf-perm-addr">
                    <Textarea
                      id="pf-perm-addr"
                      value={personalForm.permanentAddress}
                      onChange={(e) => handleFieldChange('permanentAddress', e.target.value)}
                      placeholder="Full permanent residential address..."
                      rows={2}
                    />
                  </FormField>
                )}
              </div>

              {/* Emergency Contacts Sub-card */}
              <div className="flex flex-col gap-3 pt-4 border-t border-line/40">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[12px] font-bold uppercase tracking-wider text-muted font-mono">
                      Emergency Contacts ({personalForm.emergencyContacts.length}/2)
                    </span>
                    <p className="text-[11px] text-muted">Direct contacts notified in medical or workplace emergencies</p>
                  </div>

                  {personalForm.emergencyContacts.length < 2 && (
                    <button
                      type="button"
                      onClick={handleAddEmergencyContact}
                      className="px-3 py-1.5 rounded-xl bg-surface2 border border-line hover:border-accent text-accent text-[12px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Plus size={13} strokeWidth={2.4} />
                      <span>Add contact</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  {personalForm.emergencyContacts.map((contact, index) => (
                    <div
                      key={contact.id || index}
                      className="p-4 rounded-xl bg-surface2/30 border border-line flex flex-col gap-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-ink">
                          Contact #{index + 1}
                        </span>
                        {personalForm.emergencyContacts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveContact(contact.id)}
                            className="p-1 rounded-lg text-muted hover:text-bad hover:bg-surface2"
                            title="Remove contact"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <FormField label="Full Name" id={`ec-name-${contact.id}`} required>
                          <input
                            id={`ec-name-${contact.id}`}
                            type="text"
                            value={contact.name}
                            onChange={(e) => handleUpdateContact(contact.id, 'name', e.target.value)}
                            placeholder="e.g. Arjun Nair"
                            className="w-full bg-surface2 text-ink text-[12.5px] px-3 py-2 rounded-xl border border-line focus:border-accent outline-none"
                          />
                        </FormField>

                        <FormField label="Relationship" id={`ec-rel-${contact.id}`} required>
                          <Select
                            id={`ec-rel-${contact.id}`}
                            value={contact.relationship}
                            onChange={(e) => handleUpdateContact(contact.id, 'relationship', e.target.value)}
                            options={['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other']}
                          />
                        </FormField>

                        <FormField label="Mobile Number" id={`ec-mob-${contact.id}`} required>
                          <input
                            id={`ec-mob-${contact.id}`}
                            type="tel"
                            value={contact.mobile}
                            onChange={(e) => handleUpdateContact(contact.id, 'mobile', e.target.value)}
                            placeholder="91234 56789"
                            className="w-full bg-surface2 text-ink text-[12.5px] px-3 py-2 rounded-xl border border-line focus:border-accent outline-none font-mono"
                          />
                        </FormField>

                        <FormField label="Alternate Mobile" id={`ec-alt-${contact.id}`}>
                          <input
                            id={`ec-alt-${contact.id}`}
                            type="tel"
                            value={contact.altMobile || ''}
                            onChange={(e) => handleUpdateContact(contact.id, 'altMobile', e.target.value)}
                            placeholder="Optional"
                            className="w-full bg-surface2 text-ink text-[12.5px] px-3 py-2 rounded-xl border border-line focus:border-accent outline-none font-mono"
                          />
                        </FormField>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-line/60">
                <div className="flex items-center gap-2">
                  {isDirty && (
                    <span className="text-[12px] text-warn font-semibold flex items-center gap-1.5">
                      <AlertCircle size={14} />
                      Unsaved changes pending
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    disabled={!isDirty || isSaving}
                    onClick={handleDiscardPersonal}
                    className="px-4 py-2 rounded-xl bg-surface2 text-muted hover:text-ink border border-line text-[12.5px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    disabled={!isDirty || isSaving}
                    onClick={handleSavePersonal}
                    className="px-4 py-2 rounded-xl bg-accent text-on-accent text-[12.5px] font-bold shadow-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all"
                  >
                    <Save size={14} />
                    <span>{isSaving ? 'Saving…' : 'Save changes'}</span>
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4.3 SUBVIEW: WORK DETAILS */}
      {/* ======================================================== */}
      {activeTab === 'work' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            id="pwork"
            title="Organizational & Employment Records"
            subtitle="Verified employment information managed centrally by HR"
            className="col-span-1 md:col-span-2"
            action={
              <button
                type="button"
                onClick={() => setIsChangeRequestOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-surface2 text-accent hover:bg-surface border border-line text-[12px] font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>Request a change</span>
              </button>
            }
          >
            <div className="flex flex-col gap-6">
              {/* Notice note */}
              <div className="p-3.5 rounded-xl bg-surface2/30 border border-line flex items-center gap-2.5 text-[12px] text-muted">
                <Lock size={15} className="text-muted shrink-0" />
                <span>
                  These details are managed by HR Operations. To request changes in designation, work location, or reporting hierarchy, use the Request a Change button.
                </span>
              </div>

              {/* Read-only Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-3 rounded-xl bg-surface2/30 border border-line">
                  <span className="text-[11px] text-muted uppercase font-mono block">Employee ID</span>
                  <span className="font-bold font-mono text-[14px] text-ink mt-0.5 block">{user.employeeId}</span>
                </div>

                <div className="p-3 rounded-xl bg-surface2/30 border border-line">
                  <span className="text-[11px] text-muted uppercase font-mono block">Designation</span>
                  <span className="font-bold text-[14px] text-ink mt-0.5 block">{user.designation}</span>
                </div>

                <div className="p-3 rounded-xl bg-surface2/30 border border-line">
                  <span className="text-[11px] text-muted uppercase font-mono block">Department</span>
                  <span className="font-bold text-[14px] text-ink mt-0.5 block">{user.department}</span>
                </div>

                <div className="p-3 rounded-xl bg-surface2/30 border border-line">
                  <span className="text-[11px] text-muted uppercase font-mono block">Business Unit</span>
                  <span className="font-bold text-[14px] text-ink mt-0.5 block">{user.businessUnit}</span>
                </div>

                <div className="p-3 rounded-xl bg-surface2/30 border border-line">
                  <span className="text-[11px] text-muted uppercase font-mono block">Work Location</span>
                  <span className="font-bold text-[14px] text-ink mt-0.5 block">{user.workLocation}</span>
                </div>

                <div className="p-3 rounded-xl bg-surface2/30 border border-line">
                  <span className="text-[11px] text-muted uppercase font-mono block">Employment Type</span>
                  <span className="font-bold text-[14px] text-ink mt-0.5 block">{user.employmentType}</span>
                </div>

                <div className="p-3 rounded-xl bg-surface2/30 border border-line">
                  <span className="text-[11px] text-muted uppercase font-mono block">Date of Joining</span>
                  <span className="font-bold text-[14px] text-ink mt-0.5 block">{user.joinedDate}</span>
                </div>

                <div className="p-3 rounded-xl bg-surface2/30 border border-line">
                  <span className="text-[11px] text-muted uppercase font-mono block">Probation Status</span>
                  <span className="font-bold text-[14px] text-good mt-0.5 block">{user.probationStatus}</span>
                </div>

                <div className="p-3 rounded-xl bg-surface2/30 border border-line">
                  <span className="text-[11px] text-muted uppercase font-mono block">Official Work Email</span>
                  <span className="font-bold text-[13px] text-ink mt-0.5 block font-mono">{user.workEmail}</span>
                </div>

                <div className="p-3 rounded-xl bg-surface2/30 border border-line">
                  <span className="text-[11px] text-muted uppercase font-mono block">Reporting To</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar name={user.reportingTo?.name || 'Rahul Menon'} size={22} />
                    <span className="font-bold text-[13.5px] text-ink">{user.reportingTo?.name || 'Rahul Menon'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface2/30 border border-line">
                  <span className="text-[11px] text-muted uppercase font-mono block">Cost Centre Code</span>
                  <span className="font-bold text-[14px] text-ink mt-0.5 block font-mono">{user.costCenter}</span>
                </div>

                <div className="p-3 rounded-xl bg-surface2/30 border border-line">
                  <span className="text-[11px] text-muted uppercase font-mono block">Assigned Shift</span>
                  <span className="font-bold text-[14px] text-ink mt-0.5 block">{user.shift}</span>
                </div>

                <div className="p-3 rounded-xl bg-surface2/30 border border-line">
                  <span className="text-[11px] text-muted uppercase font-mono block">Notice Period</span>
                  <span className="font-bold text-[14px] text-ink mt-0.5 block">{user.noticePeriod}</span>
                </div>
              </div>

              {/* My Change Requests List */}
              <div className="flex flex-col gap-2 pt-2 border-t border-line/40">
                <span className="text-[12px] font-bold uppercase tracking-wider text-muted font-mono">
                  My Change Requests ({user.changeRequests?.length || 0})
                </span>

                <div className="divide-y divide-line/30 rounded-xl border border-line bg-surface/30">
                  {(user.changeRequests || []).map((cr) => (
                    <div key={cr.id} className="p-3.5 flex items-center justify-between gap-3 text-[12.5px]">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-ink">{cr.field}</span>
                          <span className="text-muted">→</span>
                          <span className="font-semibold text-accent">{cr.requestedValue}</span>
                        </div>
                        <span className="text-[11px] text-muted">{cr.reason} · Requested on {cr.date}</span>
                      </div>

                      <StatusPill
                        status={cr.status === 'Approved' ? 'good' : cr.status === 'Pending' ? 'warn' : 'bad'}
                        label={cr.status}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4.4 SUBVIEW: TEAM SUMMARY */}
      {/* ======================================================== */}
      {activeTab === 'team' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            id="pteam"
            title="Team & Reporting Structure"
            subtitle="Organizational reporting hierarchy and engineering role composition"
            className="col-span-1 md:col-span-2"
            action={
              <button
                type="button"
                onClick={() => onNavigate('/dashboard/team')}
                className="px-3 py-1.5 rounded-xl bg-accent text-on-accent text-[12px] font-bold shadow-sm hover:opacity-90 flex items-center gap-1.5"
              >
                <span>Open My team</span>
                <ArrowRight size={13} />
              </button>
            }
          >
            <div className="flex flex-col gap-6">
              {/* Org Mini-Chart (SVG) */}
              <div className="p-5 rounded-2xl bg-surface2/30 border border-line flex flex-col items-center justify-center gap-4">
                {/* Reports-to box */}
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface border border-line/80 shadow-sm">
                  <Avatar name={user.reportingTo?.name || 'Rahul Menon'} size={28} />
                  <div className="flex flex-col">
                    <span className="text-[12.5px] font-bold text-ink">{user.reportingTo?.name || 'Rahul Menon'}</span>
                    <span className="text-[10.5px] text-muted">{user.reportingTo?.role || 'Director, Engineering'}</span>
                  </div>
                </div>

                {/* Vertical connecting line */}
                <div className="w-[1.5px] h-6 bg-line" />

                {/* Manager Box (Current User) */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface border-2 border-accent shadow-md">
                  <Avatar name={user.name} size={36} />
                  <div className="flex flex-col">
                    <span className="text-[13.5px] font-display font-extrabold text-ink">{user.name}</span>
                    <span className="text-[11px] text-accent font-semibold">{user.designation}</span>
                  </div>
                </div>

                {/* Vertical connecting line */}
                <div className="w-[1.5px] h-6 bg-line" />

                {/* Direct Reports Row */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center -space-x-2">
                    {['Aarav Mehta', 'Sneha Reddy', 'Vikram Singh', 'Rohan Gupta', 'Divya Nair', 'Karthik Iyer'].map((name) => (
                      <div key={name} className="ring-2 ring-bg rounded-full" title={name}>
                        <Avatar name={name} size={30} />
                      </div>
                    ))}
                    <div className="w-[30px] h-[30px] rounded-full bg-surface2 border border-line ring-2 ring-bg flex items-center justify-center font-bold text-[10.5px] text-ink select-none">
                      +18
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-muted">
                    18 Direct Reports · 6 Indirect Reports
                  </span>
                </div>
              </div>

              {/* Counts by Role Segmented Bar */}
              <div className="p-4 rounded-xl bg-surface2/30 border border-line flex flex-col gap-3">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-bold text-ink uppercase tracking-wider font-mono">
                    Team Composition by Specialization (24 Total)
                  </span>
                  <span className="text-muted font-mono">Engineering Division</span>
                </div>

                <SegBar
                  segments={[
                    { label: 'Frontend', value: 8, color: 'var(--accent)' },
                    { label: 'Backend', value: 6, color: 'var(--info)' },
                    { label: 'QA', value: 4, color: 'var(--good)' },
                    { label: 'DevOps', value: 3, color: 'var(--warn)' },
                    { label: 'Design', value: 2, color: 'var(--accent2)' },
                    { label: 'Data', value: 1, color: '#ec4899' },
                  ]}
                  height={14}
                  showLegend={true}
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4.5 SUBVIEW: SKILLS & CERTIFICATIONS */}
      {/* ======================================================== */}
      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            id="pskills"
            title="Professional Skills & Certifications"
            subtitle="Verified credentials, competencies, and language proficiencies"
            className="col-span-1 md:col-span-2"
            action={
              <button
                type="button"
                onClick={() => {
                  setViewingCert(null);
                  setIsCertDrawerOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-accent text-on-accent text-[12px] font-bold shadow-sm hover:opacity-90 flex items-center gap-1.5"
              >
                <Plus size={13} strokeWidth={2.4} />
                <span>Add certification</span>
              </button>
            }
          >
            <div className="flex flex-col gap-6">
              {/* Skills Section */}
              <div className="flex flex-col gap-3">
                <span className="text-[12px] font-bold uppercase tracking-wider text-muted font-mono">
                  Technical & Leadership Skills
                </span>

                <div className="flex items-center gap-2 flex-wrap">
                  {skillsList.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-xl bg-surface2 border border-line text-ink text-[12.5px] font-medium flex items-center gap-1.5 group"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-muted hover:text-bad"
                        title={`Remove ${skill}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add Skill Input */}
                <div className="flex items-center gap-2 max-w-sm mt-1">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                    placeholder="Type skill & press Enter (e.g. Next.js)..."
                    className="flex-1 bg-surface2 text-ink text-[12px] px-3 py-1.5 rounded-xl border border-line focus:border-accent outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-1.5 rounded-xl bg-surface2 text-accent border border-line text-[12px] font-semibold hover:bg-surface"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Certifications Table */}
              <div className="flex flex-col gap-3 pt-4 border-t border-line/40">
                <span className="text-[12px] font-bold uppercase tracking-wider text-muted font-mono">
                  Certifications & Accreditations
                </span>

                <div className="overflow-x-auto w-full rounded-xl border border-line bg-surface/30">
                  <table className="w-full border-collapse text-left min-w-[620px] text-[12.5px]">
                    <thead>
                      <tr className="border-b border-line bg-surface2/50 text-[11px] font-bold uppercase tracking-wider text-muted font-mono">
                        <th className="py-2.5 px-3">Certification</th>
                        <th className="py-2.5 px-3">Issuer</th>
                        <th className="py-2.5 px-3">Issued</th>
                        <th className="py-2.5 px-3">Expiry Date</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/30">
                      {certificationsList.map((cert) => {
                        const isExpiringSoon = cert.expiryDate?.includes('2026');

                        return (
                          <tr key={cert.id} className="hover:bg-surface2/40 transition-colors">
                            <td className="py-3 px-3 font-semibold text-ink flex items-center gap-2">
                              <Award size={15} className="text-accent shrink-0" />
                              <span>{cert.name}</span>
                            </td>
                            <td className="py-3 px-3 text-muted">{cert.issuer}</td>
                            <td className="py-3 px-3 font-mono text-muted text-[11.5px]">{cert.issuedDate}</td>
                            <td className="py-3 px-3 font-mono text-[11.5px]">
                              <span className={cert.status === 'Expired' ? 'text-bad' : isExpiringSoon ? 'text-warn font-bold' : 'text-muted'}>
                                {cert.expiryDate}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <StatusPill
                                status={cert.status === 'Verified' ? 'good' : 'bad'}
                                label={cert.status}
                              />
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setViewingCert(cert);
                                  setIsCertDrawerOpen(true);
                                }}
                                className="text-[12px] text-accent font-semibold hover:underline"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Languages Known */}
              <div className="flex flex-col gap-2 pt-4 border-t border-line/40">
                <span className="text-[12px] font-bold uppercase tracking-wider text-muted font-mono">
                  Languages Known
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {(user.languages || []).map((lang) => (
                    <Tag key={lang} variant="default">{lang}</Tag>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4.6 SUBVIEW: ACTIVITY TIMELINE */}
      {/* ======================================================== */}
      {activeTab === 'activity' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            id="pactivity"
            title="Account & Managerial Activity Log"
            subtitle="Audit trail of security actions, profile edits, and team approvals"
            className="col-span-1 md:col-span-2"
            action={
              <div className="flex items-center gap-1.5 bg-surface2 p-1 rounded-xl border border-line text-[11.5px] font-semibold">
                {['All', 'Security', 'Profile', 'Approvals'].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActivityFilter(filter)}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      activityFilter === filter ? 'bg-accent text-on-accent' : 'text-muted'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            }
          >
            <div className="flex flex-col divide-y divide-dashed divide-line/60">
              {filteredActivity.length === 0 ? (
                <div className="py-12 text-center text-muted italic text-[12.5px]">
                  No activity records match this filter.
                </div>
              ) : (
                filteredActivity.map((act) => (
                  <div key={act.id} className="py-3.5 flex items-center justify-between gap-3 text-[12.5px]">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-surface2 border border-line flex items-center justify-center text-accent shrink-0">
                        <Activity size={14} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-ink leading-snug">{act.text}</span>
                        <span className="text-[11px] text-muted">Category: {act.type}</span>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-muted shrink-0">
                      {act.timestamp}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Drawers */}
      <PhotoUploader
        isOpen={isPhotoUploaderOpen}
        onClose={() => setIsPhotoUploaderOpen(false)}
        currentPhoto={user.photoUrl}
        onSavePhoto={(url) => {
          updatePhoto(url);
          notify('Profile photo updated', () => removePhoto());
        }}
        onRemovePhoto={() => {
          removePhoto();
          notify('Profile photo removed');
        }}
        userName={user.name}
      />

      <ChangeRequestDrawer
        isOpen={isChangeRequestOpen}
        onClose={() => setIsChangeRequestOpen(false)}
        onSubmitRequest={handleSubmitChangeRequest}
      />

      <CertificationDrawer
        isOpen={isCertDrawerOpen}
        onClose={() => {
          setIsCertDrawerOpen(false);
          setViewingCert(null);
        }}
        onAddCertification={handleAddCertification}
        viewingCertification={viewingCert}
      />
    </div>
  );
}

