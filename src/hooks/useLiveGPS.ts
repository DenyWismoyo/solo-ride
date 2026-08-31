import { useState, useEffect, useRef } from "react";
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

  const lastPosRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsData((prev) => ({ ...prev, error: "Geolocation tidak didukung oleh browser Anda." }));
      return;
    }

    const updateCoords = (latitude: number, longitude: number) => {
      lastPosRef.current = { lat: latitude, lng: longitude };
      const dist = calculateDistance(latitude, longitude, DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
      const isWithin = dist <= GEOFENCE_RADIUS_KM;

      setGpsData({
        location: { lat: latitude, lng: longitude },
        error: null,
        isWithinGeofence: isWithin,
        distanceFromCenter: dist,
      });
    };

    // 1. Initial quick fetch
    navigator.geolocation.getCurrentPosition(
      (pos) => updateCoords(pos.coords.latitude, pos.coords.longitude),
      (err) => {
        // Ignored if watchPosition succeeds
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );

    // 2. Watch updates
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        updateCoords(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        // Jangan hapus location terakhir jika hanya timeout sementara
        if (!lastPosRef.current) {
          setGpsData((prev) => ({ ...prev, error: error.message }));
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 4000,
        timeout: 10000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return gpsData;
}
