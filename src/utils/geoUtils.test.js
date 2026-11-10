import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculateDistanceMeters,
  formatCoordinates,
  evaluateGeofence,
  OFFICES,
} from './geoUtils.js';

describe('GPS Geofencing Utility Tests', () => {
  it('1. Calculates distance correctly using Haversine formula', () => {
    // Distance between Bengaluru office center and a point ~100m away
    const blr = OFFICES.bengaluru;
    const distance = calculateDistanceMeters(blr.lat, blr.lng, blr.lat + 0.0005, blr.lng + 0.0005);
    assert.ok(distance > 50 && distance < 120, `Expected distance ~75m, got ${distance}`);
  });

  it('2. Evaluates inside geofence when coordinates are within 200m', () => {
    const blr = OFFICES.bengaluru;
    const nearCoords = { lat: blr.lat + 0.0002, lng: blr.lng + 0.0002 };
    const result = evaluateGeofence(nearCoords, 'bengaluru');
    assert.strictEqual(result.isInside, true);
    assert.strictEqual(result.status, 'inside');
    assert.ok(result.distanceMeters <= 200);
  });

  it('3. Evaluates outside geofence when coordinates exceed 200m radius', () => {
    const blr = OFFICES.bengaluru;
    // 0.015 deg lat difference is roughly 1.6 km
    const farCoords = { lat: blr.lat + 0.015, lng: blr.lng + 0.015 };
    const result = evaluateGeofence(farCoords, 'bengaluru');
    assert.strictEqual(result.isInside, false);
    assert.strictEqual(result.status, 'outside');
    assert.ok(result.distanceMeters > 200);
  });

  it('4. Handles missing or null coordinates gracefully', () => {
    const result = evaluateGeofence(null, 'bengaluru');
    assert.strictEqual(result.isInside, false);
    assert.strictEqual(result.status, 'no_coords');
  });

  it('5. Formats GPS coordinates to human-readable string', () => {
    const str = formatCoordinates(12.9352, 77.6946);
    assert.strictEqual(str, '12.9352° N, 77.6946° E');
  });
});

