// Mock Profile and Settings Service
// Mock only. Replace with real API in production.

import { defaultProfile } from '../data/profile';
import { defaultSettings } from '../data/settings';
import { initialSessions } from '../data/sessions';

const STORAGE_KEYS = {
  PROFILE: 'hrms_profile',
  SETTINGS: 'hrms_settings',
  SESSIONS: 'hrms_sessions',
};

// Simulate realistic network delay (400–700ms)
function delay(min = 400, max = 700) {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const profileService = {
  // 1. Get Profile
  async getProfile() {
    await delay();
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name === 'Priya Nair') {
          parsed.name = 'Lokesh Kumar';
          parsed.preferredName = 'Lokesh';
          parsed.avatar = 'LK';
          parsed.workEmail = 'lokesh.kumar@company.in';
          localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse hrms_profile from localStorage:', e);
    }
    // Initialize with default
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(defaultProfile));
    return defaultProfile;
  },

  // 2. Update Profile
  async updateProfile(updates) {
    await delay(500, 700);
    const current = await this.getProfile();
    const updated = {
      ...current,
      ...updates,
      activity: [
        {
          id: `act-${Date.now()}`,
          type: 'Profile',
          text: 'Profile details updated by manager',
          timestamp: 'Just now',
        },
        ...(current.activity || []),
      ],
    };

    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    return updated;
  },

  // 3. Upload Photo (validated max 2MB, JPG/PNG)
  async uploadPhoto(dataUrl) {
    await delay(600, 750);
    const current = await this.getProfile();
    const updated = {
      ...current,
      photoUrl: dataUrl,
      activity: [
        {
          id: `act-${Date.now()}`,
          type: 'Profile',
          text: 'Profile photo updated',
          timestamp: 'Just now',
        },
        ...(current.activity || []),
      ],
    };

    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    return updated;
  },

  // 4. Remove Photo
  async removePhoto() {
    await delay(400, 600);
    const current = await this.getProfile();
    const updated = {
      ...current,
      photoUrl: null,
      activity: [
        {
          id: `act-${Date.now()}`,
          type: 'Profile',
          text: 'Profile photo removed',
          timestamp: 'Just now',
        },
        ...(current.activity || []),
      ],
    };

    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    return updated;
  },

  // 5. Get Settings
  async getSettings() {
    await delay();
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse hrms_settings from localStorage:', e);
    }
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    return defaultSettings;
  },

  // 6. Update Settings
  async updateSettings(sectionKey, sectionValues) {
    await delay(500, 700);
    const current = await this.getSettings();
    const updated = {
      ...current,
      [sectionKey]: {
        ...current[sectionKey],
        ...sectionValues,
      },
    };

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  },

  // 7. Change Password
  async changePassword(currentPassword, newPassword) {
    await delay(600, 800);
    if (!currentPassword) {
      throw new Error('Current password is required');
    }
    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters');
    }
    if (newPassword === currentPassword) {
      throw new Error('New password cannot equal the current password');
    }

    // Add activity record
    const profile = await this.getProfile();
    const updatedProfile = {
      ...profile,
      activity: [
        {
          id: `act-${Date.now()}`,
          type: 'Security',
          text: 'Account password changed successfully',
          timestamp: 'Just now',
        },
        ...(profile.activity || []),
      ],
    };
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updatedProfile));

    return { success: true };
  },

  // 8. List Active Sessions
  async listSessions() {
    await delay();
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse hrms_sessions from localStorage:', e);
    }
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(initialSessions));
    return initialSessions;
  },

  // 9. Revoke Session
  async revokeSession(sessionId) {
    await delay(400, 600);
    const sessions = await this.listSessions();
    const updated = sessions.filter((s) => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
    return updated;
  },

  // 10. Revoke All Other Sessions
  async revokeAllOtherSessions() {
    await delay(500, 700);
    const sessions = await this.listSessions();
    const updated = sessions.filter((s) => s.isCurrent);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
    return updated;
  },
};

