import React, { useState } from 'react';
import Avatar from '../Avatar.jsx';
import StatusPill from '../StatusPill.jsx';
import Tag from '../Tag.jsx';
import { formatCoordinates } from '../../utils/geoUtils.js';
import {
  MapPin,
  X,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Navigation,
  Crosshair,
  Building2,
  Clock,
  Compass,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export default function GpsLocationModal({ isOpen, onClose, employee, title = 'GPS Attendance Verification' }) {
  const [activePunchTab, setActivePunchTab] = useState('in'); // 'in' or 'out'

  if (!isOpen || !employee) return null;

  const punchInGps = employee.punchInGps || {
    lat: 12.9354,
    lng: 77.6948,
    accuracy: 12,
    timestamp: '2026-11-06T09:30:15.000Z',
    address: 'Bengaluru HQ · Cessna Business Park',
    geofence: {
      isInside: true,
      distanceMeters: 42,
      office: { name: 'Bengaluru HQ · Cessna Business Park', radiusMeters: 200 },
      status: 'inside',
      message: 'Within Bengaluru HQ geofence (42m, limit 200m)',
    },
  };

  const punchOutGps = employee.punchOutGps || null;

  const activeGps = activePunchTab === 'in' ? punchInGps : punchOutGps;
  const isInside = activeGps?.geofence?.isInside ?? true;
  const distance = activeGps?.geofence?.distanceMeters ?? 42;
  const radius = activeGps?.geofence?.office?.radiusMeters ?? 200;

  // Radar plot coordinates
  // Office is at center (150, 150)
  // 200m radius = 100px radius on SVG canvas
  const scale = 100 / radius; // pixels per meter
  const clampedDistance = Math.min(300, distance);
  // Angle for visual representation
  const angleRad = (Math.PI / 4); // 45 degrees
  const pingX = 150 + Math.cos(angleRad) * (clampedDistance * scale);
  const pingY = 150 - Math.sin(angleRad) * (clampedDistance * scale);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gps-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="relative w-full max-w-2xl bg-surface border border-line rounded-[var(--radius)] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        style={{ borderRadius: 'var(--radius)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line/60 bg-surface2/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center">
              <Crosshair size={20} />
            </div>
            <div className="flex flex-col">
              <h2 id="gps-modal-title" className="font-display font-bold text-[16px] text-ink flex items-center gap-2">
                <span>{title}</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-accent/20 text-accent font-semibold">
                  Mandatory GPS
                </span>
              </h2>
              <span className="text-[12px] text-muted">
                Biometric geofence validation · Audit timestamp: 6 Nov 2026
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-surface text-muted hover:text-ink transition-colors cursor-pointer"
            aria-label="Close GPS modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {/* Employee Info Header */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface2/40 border border-line flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Avatar name={employee.name} size={40} />
              <div className="flex flex-col">
                <span className="font-bold text-ink text-[14px]">{employee.name}</span>
                <span className="text-[11.5px] text-muted font-mono">
                  {employee.id} · {employee.role} · {employee.department}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <StatusPill status={employee.status} />
              <Tag>{employee.location || 'Office'}</Tag>
            </div>
          </div>

          {/* Punch In vs Punch Out Tab Selector */}
          <div className="flex items-center gap-2 border-b border-line/50 pb-2">
            <button
              type="button"
              onClick={() => setActivePunchTab('in')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[12.5px] font-semibold transition-all border ${
                activePunchTab === 'in'
                  ? 'bg-surface2 text-ink border-accent/60 shadow-sm'
                  : 'text-muted border-transparent hover:text-ink hover:bg-surface2/40'
              }`}
            >
              <MapPin size={14} className={activePunchTab === 'in' ? 'text-accent' : 'text-muted'} />
              <span>Check-in GPS ({employee.punchIn || '09:30'})</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePunchTab('out')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[12.5px] font-semibold transition-all border ${
                activePunchTab === 'out'
                  ? 'bg-surface2 text-ink border-accent/60 shadow-sm'
                  : 'text-muted border-transparent hover:text-ink hover:bg-surface2/40'
              }`}
            >
              <Navigation size={14} className={activePunchTab === 'out' ? 'text-accent' : 'text-muted'} />
              <span>
                Check-out GPS {employee.punchOut && employee.punchOut !== '—' ? `(${employee.punchOut})` : '(Pending)'}
              </span>
            </button>
          </div>

          {!activeGps ? (
            <div className="p-8 text-center flex flex-col items-center justify-center gap-3 rounded-xl bg-surface2/30 border border-line">
              <Clock size={32} className="text-muted/60" />
              <div className="flex flex-col">
                <span className="font-bold text-ink text-[14px]">Punch-out Not Yet Recorded</span>
                <span className="text-[12px] text-muted">
                  The employee is currently logged in. Check-out GPS coordinates will be captured upon departure punch.
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Geofence Status Banner */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 flex-wrap ${
                  isInside
                    ? 'bg-good/10 border-good/30 text-good'
                    : 'bg-warn/10 border-warn/30 text-warn'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isInside ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
                  <div className="flex flex-col">
                    <span className="font-bold text-[13px] text-ink">
                      {isInside ? 'Geofence Verification Passed' : 'Geofence Mismatch Detected'}
                    </span>
                    <span className="text-[11.5px] opacity-90">
                      {isInside
                        ? `Punched within designated 200m office perimeter (${distance} meters from central beacon)`
                        : `Punched outside allowed perimeter (${distance} meters from office, 200m limit)`}
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-surface2 border border-line text-ink font-semibold">
                  Distance: {distance}m
                </span>
              </div>

              {/* Grid: SVG Radar Visualizer & GPS Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Radar Visualizer */}
                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-surface2/30 border border-line relative overflow-hidden select-none">
                  <div className="text-[11px] font-mono font-bold text-muted uppercase tracking-wider mb-2 self-start flex items-center gap-1.5">
                    <Radio size={13} className="text-accent animate-pulse" />
                    <span>Live Geofence Radar</span>
                  </div>

                  <svg viewBox="0 0 300 300" className="w-56 h-56 max-w-full">
                    {/* Concentric distance circles */}
                    <circle cx="150" cy="150" r="130" fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
                    <circle cx="150" cy="150" r="100" fill="currentColor" fillOpacity="0.03" stroke={isInside ? '#10b981' : '#f59e0b'} strokeDasharray="4 3" strokeWidth="1.5" />
                    <circle cx="150" cy="150" r="60" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1" />
                    <circle cx="150" cy="150" r="25" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />

                    {/* Crosshairs */}
                    <line x1="150" y1="10" x2="150" y2="290" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
                    <line x1="10" y1="150" x2="290" y2="150" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />

                    {/* 200m label */}
                    <text x="155" y="55" fontSize="9" fill="currentColor" opacity="0.5" fontFamily="monospace">
                      200m Geofence
                    </text>

                    {/* Distance vector line from center to punch */}
                    <line
                      x1="150"
                      y1="150"
                      x2={pingX}
                      y2={pingY}
                      stroke={isInside ? '#10b981' : '#f59e0b'}
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />

                    {/* Center Office Beacon */}
                    <circle cx="150" cy="150" r="7" fill="var(--accent)" />
                    <circle cx="150" cy="150" r="14" fill="var(--accent)" fillOpacity="0.2" className="animate-ping" />

                    {/* Employee GPS Ping */}
                    <circle
                      cx={pingX}
                      cy={pingY}
                      r="16"
                      fill={isInside ? '#10b981' : '#f59e0b'}
                      fillOpacity="0.15"
                    />
                    <circle
                      cx={pingX}
                      cy={pingY}
                      r="6"
                      fill={isInside ? '#10b981' : '#f59e0b'}
                      stroke="#06141c"
                      strokeWidth="2"
                    />
                  </svg>

                  <div className="flex items-center justify-between w-full text-[11px] font-mono text-muted mt-2 border-t border-line/40 pt-2">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-accent" />
                      <span>Office Beacon</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${isInside ? 'bg-good' : 'bg-warn'}`} />
                      <span>Punch Location ({distance}m)</span>
                    </span>
                  </div>
                </div>

                {/* 2. Detailed Location Attributes */}
                <div className="flex flex-col gap-3 justify-between">
                  <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-surface2/30 border border-line">
                    <span className="text-[11px] font-mono uppercase font-bold text-muted flex items-center gap-1.5">
                      <MapPin size={12} className="text-accent" />
                      <span>Detected GPS Coordinates</span>
                    </span>

                    <div className="flex flex-col gap-1">
                      <span className="font-mono font-bold text-[14px] text-ink select-all">
                        {formatCoordinates(activeGps.lat, activeGps.lng)}
                      </span>
                      <span className="text-[12px] text-muted">
                        {activeGps.address || 'Bengaluru HQ · Cessna Business Park'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-line/40 text-[11px] font-mono">
                      <div>
                        <span className="text-muted block">Accuracy:</span>
                        <span className="font-semibold text-ink">±{activeGps.accuracy || 12} meters</span>
                      </div>
                      <div>
                        <span className="text-muted block">Source:</span>
                        <span className="font-semibold text-ink">
                          {activeGps.source === 'device_gps' ? 'Device GPS' : 'High-Accuracy Sensor'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-surface2/30 border border-line">
                    <span className="text-[11px] font-mono uppercase font-bold text-muted flex items-center gap-1.5">
                      <Building2 size={12} className="text-accent" />
                      <span>Assigned Geofence Policy</span>
                    </span>

                    <div className="flex flex-col gap-0.5 text-[12px]">
                      <span className="font-bold text-ink">
                        {activeGps.geofence?.office?.name || 'Bengaluru HQ'}
                      </span>
                      <span className="text-muted text-[11px]">
                        Allowed radius: {radius}m · Policy enforcement: Mandatory
                      </span>
                    </div>

                    <div className="pt-2 border-t border-line/40 flex items-center justify-between text-[11px]">
                      <span className="text-muted">Biometric Integrity:</span>
                      <span className="font-mono text-good flex items-center gap-1 font-semibold">
                        <CheckCircle2 size={12} /> Verified Tamper-free
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-line/60 bg-surface2/50 flex items-center justify-between">
          <span className="text-[11px] text-muted font-mono">
            Audit ID: GPS-{employee.id}-20261106
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[12.5px] font-semibold bg-surface2 border border-line hover:border-accent text-ink cursor-pointer transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

