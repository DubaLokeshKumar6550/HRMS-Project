import React, { createContext, useContext, useState, useEffect } from 'react';
import { profileService } from '../services/profileService';
import { defaultProfile } from '../data/profile';
import { defaultSettings } from '../data/settings';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(defaultProfile);
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from profileService / localStorage
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [prof, sett] = await Promise.all([
          profileService.getProfile(),
          profileService.getSettings(),
        ]);
        if (mounted) {
          if (prof) setUser(prof);
          if (sett) setSettings(sett);
        }
      } catch (err) {
        console.error('Failed to load profile/settings in AuthProvider:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Update profile in state and localStorage
  const updateUser = async (updates) => {
    const updated = await profileService.updateProfile(updates);
    setUser(updated);
    return updated;
  };

  // Upload photo
  const updatePhoto = async (dataUrl) => {
    const updated = await profileService.uploadPhoto(dataUrl);
    setUser(updated);
    return updated;
  };

  // Remove photo
  const removePhoto = async () => {
    const updated = await profileService.removePhoto();
    setUser(updated);
    return updated;
  };

  // Update specific settings section
  const updateSettingsSection = async (sectionKey, sectionValues) => {
    const updated = await profileService.updateSettings(sectionKey, sectionValues);
    setSettings(updated);
    return updated;
  };

  // Apply density preference if present
  useEffect(() => {
    if (settings?.preferences?.displayDensity === 'Compact') {
      document.documentElement.setAttribute('data-density', 'compact');
    } else {
      document.documentElement.removeAttribute('data-density');
    }
  }, [settings?.preferences?.displayDensity]);

  return (
    <AuthContext.Provider
      value={{
        user,
        settings,
        isLoading,
        updateUser,
        updatePhoto,
        removePhoto,
        updateSettingsSection,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

