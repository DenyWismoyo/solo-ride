import { useState, useEffect } from "react";
import { calculateDistance } from "@/lib/utils";
import { DEFAULT_CENTER } from "@/constants/maps";

interface LiveGPSData {
  location: { lat: number; lng: number } | null;
  error: string | null;
  isWithinGeofence: boolean;
  distanceFromCenter: number | null;
}

const GEOFENCE_RADIUS_KM = 15; // Jangkauan maksimal 15 KM dari pusat Solo

export function useLiveGPS() {
  const [gpsData, setGpsData] = useState<LiveGPSData>({
    location: null,
    error: null,
    isWithinGeofence: false,
    distanceFromCenter: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsData((prev) => ({ ...prev, error: "Geolocation tidak didukung oleh browser Anda." }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const dist = calculateDistance(latitude, longitude, DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
        const isWithin = dist <= GEOFENCE_RADIUS_KM;

        setGpsData({
          location: { lat: latitude, lng: longitude },
          error: null,
          isWithinGeofence: isWithin,
          distanceFromCenter: dist,
        });
      },
      (error) => {
        setGpsData((prev) => ({ ...prev, error: error.message }));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return gpsData;
}
