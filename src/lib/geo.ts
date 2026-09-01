/**
 * Geo & Distance utility functions for Ride-Solo Hyperlocal Surakarta
 */
import { DEFAULT_CENTER, GEOFENCE_MAX_RADIUS_KM } from "../constants/maps";

/**
 * Calculates distance between two GPS coordinates using the Haversine formula.
 * @returns Distance in kilometers
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Formats a distance in kilometers into a human-readable string.
 * e.g. 0.8 km -> "800 m", 2.4 km -> "2.4 km"
 */
export function formatDistance(km?: number | null): string {
  if (km === undefined || km === null || isNaN(km)) return "-";
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Checks if a given coordinate is within the allowed Geofence radius of Solo.
 */
export function isWithinGeofence(lat: number, lng: number): boolean {
  const distance = calculateDistanceKm(
    DEFAULT_CENTER.lat,
    DEFAULT_CENTER.lng,
    lat,
    lng
  );
  return distance <= GEOFENCE_MAX_RADIUS_KM;
}
