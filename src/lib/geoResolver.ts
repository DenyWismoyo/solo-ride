import { SURAKARTA_MASTER_PLACES, SoloPlaceItem } from "@/constants/surakartaPlaces";
import { LocationPoint } from "@/types/order.types";

/**
 * Calculates haversine distance in meters between two lat/lng points
 */
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Resolves nearest Surakarta landmark or kelurahan using local geometric index
 */
export function getLocalNearestAddress(lat: number, lng: number): string {
  let closest: SoloPlaceItem = SURAKARTA_MASTER_PLACES[0];
  let minDistance = Infinity;

  for (const place of SURAKARTA_MASTER_PLACES) {
    const dist = getDistanceMeters(lat, lng, place.lat, place.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = place;
    }
  }

  if (minDistance < 200) {
    return `${closest.name}, ${closest.address}`;
  } else if (minDistance < 800) {
    return `Kawasan ${closest.name}, Kec. ${closest.district}, Surakarta`;
  } else {
    return `${closest.address}, Surakarta`;
  }
}

/**
 * Resilient Reverse Geocoder:
 * Tries OpenStreetMap Nominatim first, falls back instantly to local 54-kelurahan index.
 * Does NOT call unactivated Google Cloud Geocoding API to prevent console red errors.
 */
export async function reverseGeocodeSurakarta(lat: number, lng: number): Promise<string> {
  const localFallback = getLocalNearestAddress(lat, lng);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "Accept-Language": "id,en",
        "User-Agent": "RideSolo-Surakarta-App/1.0",
      },
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        // Extract road, suburb, and city
        const addr = data.address || {};
        const road = addr.road || addr.pedestrian || addr.building || addr.amenity;
        const suburb = addr.suburb || addr.village || addr.neighbourhood;
        const city = addr.city || addr.town || "Surakarta";

        if (road && suburb) {
          return `${road}, ${suburb}, ${city}`;
        } else if (road) {
          return `${road}, ${city}`;
        } else if (data.display_name) {
          // Take first 3 parts of the display name
          const parts = data.display_name.split(",").map((s: string) => s.trim());
          return parts.slice(0, 3).join(", ");
        }
      }
    }
  } catch (err) {
    // Network or timeout error -> Fallback gracefully
  }

  return localFallback;
}
