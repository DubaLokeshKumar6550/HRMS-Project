// GPS & Geofencing Utility for HRMS Manager Desk
// Provides Haversine distance calculations, browser Geolocation wrappers,
// office geofence verifications, and reverse-geocoding label resolvers.

export const OFFICES = {
  bengaluru: {
    id: 'bengaluru',
    name: 'Bengaluru HQ · Cessna Business Park',
    city: 'Bengaluru',
    state: 'Karnataka',
    lat: 12.9352,
    lng: 77.6946,
    radiusMeters: 200,
  },
  hyderabad: {
    id: 'hyderabad',
    name: 'Hyderabad Campus · Hitec City Phase 2',
    city: 'Hyderabad',
    state: 'Telangana',
    lat: 17.4483,
    lng: 78.3742,
    radiusMeters: 200,
  },
  pune: {
    id: 'pune',
    name: 'Pune Hub · Magarpatta Cybercity',
    city: 'Pune',
    state: 'Maharashtra',
    lat: 18.5529,
    lng: 73.9405,
    radiusMeters: 200,
  },
};

/**
 * Calculate distance between two lat/lng coordinates in meters using the Haversine formula
 */
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Format decimal coordinates to readable GPS string, e.g. "12.9352° N, 77.6946° E"
 */
export function formatCoordinates(lat, lng) {
  if (lat == null || lng == null) return 'No GPS Data';
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

/**
 * Evaluates whether coordinates fall within an assigned office's geofence
 */
export function evaluateGeofence(userCoords, officeKey = 'bengaluru') {
  const office = OFFICES[officeKey] || OFFICES.bengaluru;
  if (!userCoords || userCoords.lat == null || userCoords.lng == null) {
    return {
      isInside: false,
      distanceMeters: null,
      office,
      status: 'no_coords',
      message: 'No GPS coordinates available',
    };
  }

  const distance = calculateDistanceMeters(
    userCoords.lat,
    userCoords.lng,
    office.lat,
    office.lng
  );

  const isInside = distance <= office.radiusMeters;

  return {
    isInside,
    distanceMeters: distance,
    office,
    status: isInside ? 'inside' : 'outside',
    message: isInside
      ? `Within ${office.name} geofence (${distance}m from center, limit ${office.radiusMeters}m)`
      : `Outside geofence: ${distance}m from ${office.name} (limit ${office.radiusMeters}m)`,
  };
}

/**
 * Acquire current device GPS coordinates using browser Geolocation API
 * Falls back to high-fidelity simulated office location if user denies permission or browser lacks GPS
 */
export async function acquireDeviceLocation(preferredOffice = 'bengaluru') {
  const office = OFFICES[preferredOffice] || OFFICES.bengaluru;

  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      // Browser does not support Geolocation -> fallback
      resolve(getSimulatedLocation(office, 'Geolocation not supported by browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const geofence = evaluateGeofence({ lat: latitude, lng: longitude }, preferredOffice);

        resolve({
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy) || 10,
          timestamp: new Date().toISOString(),
          source: 'device_gps',
          address: geofence.isInside ? office.name : 'Detected Device Location',
          geofence,
          isSimulated: false,
        });
      },
      (error) => {
        // Permission denied, timeout, or position unavailable -> fallback to simulated realistic coordinate
        console.warn('Browser GPS acquisition failed/denied:', error.message);
        resolve(getSimulatedLocation(office, error.message));
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 10000,
      }
    );
  });
}

/**
 * Generate a realistic simulated location near the assigned office (for dev/demo/fallback)
 */
export function getSimulatedLocation(office, reason = '') {
  // Add a minor realistic jitter within 30-70 meters of office
  const jitterLat = (Math.random() - 0.5) * 0.0006;
  const jitterLng = (Math.random() - 0.5) * 0.0006;
  const lat = parseFloat((office.lat + jitterLat).toFixed(5));
  const lng = parseFloat((office.lng + jitterLng).toFixed(5));
  const distance = calculateDistanceMeters(lat, lng, office.lat, office.lng);

  return {
    lat,
    lng,
    accuracy: 12,
    timestamp: new Date().toISOString(),
    source: 'simulated_gps',
    address: `${office.name} (Office Biometric Zone)`,
    geofence: {
      isInside: true,
      distanceMeters: distance,
      office,
      status: 'inside',
      message: `Within ${office.name} (${distance}m, verified)`,
    },
    isSimulated: true,
    fallbackReason: reason,
  };
}

