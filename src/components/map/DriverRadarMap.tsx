"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { GoogleMap, HeatmapLayer, Marker, Circle } from "@react-google-maps/api";
import { useGoogleMaps } from "@/components/map/GoogleMapsProvider";
import { DEFAULT_CENTER, DEFAULT_ZOOM, MAP_DARK_STYLE, MAP_LIGHT_STYLE } from "@/constants/maps";
import { DEMAND_HOTSPOTS_SOLO, DemandHotspot, SOLO_DISTRICTS, SoloDistrict } from "@/constants/geofencing";
import { Loader2, Flame, MapPin, Compass, Navigation } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

interface DriverRadarMapProps {
  isOnline: boolean;
  driverLocation: { lat: number; lng: number } | null;
  selectedDistrictId?: string;
  focusedHotspot?: DemandHotspot | null;
  onSelectHotspot?: (hotspot: DemandHotspot) => void;
}

export function DriverRadarMap({
  isOnline,
  driverLocation,
  selectedDistrictId = "all",
  focusedHotspot = null,
  onSelectHotspot
}: DriverRadarMapProps) {
  const { isLoaded } = useGoogleMaps();
  const { theme } = useTheme();
  const mapRef = useRef<google.maps.Map | null>(null);
  
  const [isDarkEffective, setIsDarkEffective] = useState(true);

  useEffect(() => {
    if (theme === "dark") {
      setIsDarkEffective(true);
    } else if (theme === "light") {
      setIsDarkEffective(false);
    } else if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      setIsDarkEffective(mediaQuery.matches);
      
      const listener = (e: MediaQueryListEvent) => setIsDarkEffective(e.matches);
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, [theme]);

  // Heatmap Data points
  const heatmapData = useMemo(() => {
    if (!isLoaded || !window.google || !window.google.maps || !window.google.maps.LatLng) {
      return [];
    }
    return DEMAND_HOTSPOTS_SOLO.map(spot => ({
      location: new window.google.maps.LatLng(spot.lat, spot.lng),
      weight: spot.weight
    }));
  }, [isLoaded]);

  // Selected district center & zoom
  const activeDistrict = useMemo(() => {
    return SOLO_DISTRICTS.find(d => d.id === selectedDistrictId);
  }, [selectedDistrictId]);

  // Handle map panning when district or focused hotspot changes
  useEffect(() => {
    if (!mapRef.current) return;

    if (focusedHotspot) {
      mapRef.current.panTo({ lat: focusedHotspot.lat, lng: focusedHotspot.lng });
      mapRef.current.setZoom(16);
    } else if (activeDistrict) {
      mapRef.current.panTo(activeDistrict.center);
      mapRef.current.setZoom(14);
    } else if (driverLocation) {
      mapRef.current.panTo(driverLocation);
      mapRef.current.setZoom(15);
    } else {
      mapRef.current.panTo(DEFAULT_CENTER);
      mapRef.current.setZoom(DEFAULT_ZOOM);
    }
  }, [focusedHotspot, activeDistrict, driverLocation]);

  if (!isLoaded || typeof window === "undefined" || typeof window.google?.maps?.Map !== "function") {
    return (
      <div className={`relative flex flex-col items-center justify-center ${isDarkEffective ? "bg-slate-950 text-slate-400" : "bg-slate-100 text-slate-600"} text-xs w-full h-full min-h-[340px] rounded-3xl`}>
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-2" />
        <span className="text-xs font-semibold">Memuat Radar Hyperlocal Solo...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[340px] overflow-hidden rounded-[2rem] border border-slate-200/80 dark:border-white/[0.08] shadow-sm">
      <GoogleMap
        onLoad={(map) => {
          mapRef.current = map;
        }}
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={driverLocation || (activeDistrict?.center || DEFAULT_CENTER)}
        zoom={driverLocation ? 15 : (activeDistrict ? 14 : DEFAULT_ZOOM)}
        options={{
          disableDefaultUI: true,
          zoomControl: false,
          styles: isDarkEffective ? MAP_DARK_STYLE : MAP_LIGHT_STYLE,
          gestureHandling: "greedy",
        }}
      >
        {/* District Boundary Circles */}
        {activeDistrict && (
          <Circle
            center={activeDistrict.center}
            radius={activeDistrict.radiusMeters}
            options={{
              strokeColor: "#10b981",
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: "#10b981",
              fillOpacity: 0.08,
            }}
          />
        )}

        {/* HeatmapLayer only active when driver is online */}
        {isOnline && heatmapData.length > 0 && (
          <HeatmapLayer
            data={heatmapData}
            options={{
              radius: 45,
              opacity: 0.65,
              gradient: [
                "rgba(0, 255, 255, 0)",
                "rgba(0, 255, 255, 1)",
                "rgba(0, 191, 255, 1)",
                "rgba(0, 127, 255, 1)",
                "rgba(0, 63, 255, 1)",
                "rgba(0, 0, 255, 1)",
                "rgba(0, 0, 223, 1)",
                "rgba(0, 0, 191, 1)",
                "rgba(0, 0, 159, 1)",
                "rgba(0, 0, 127, 1)",
                "rgba(63, 0, 91, 1)",
                "rgba(127, 0, 63, 1)",
                "rgba(191, 0, 31, 1)",
                "rgba(255, 0, 0, 1)"
              ]
            }}
          />
        )}

        {/* Hotspot Markers */}
        {isOnline && DEMAND_HOTSPOTS_SOLO.map((spot) => {
          const isFocused = focusedHotspot?.id === spot.id;
          const isHighDemand = spot.demandLevel === "Sangat Tinggi";

          return (
            <Marker
              key={spot.id}
              position={{ lat: spot.lat, lng: spot.lng }}
              title={`${spot.name} (${spot.demandLevel})`}
              onClick={() => onSelectHotspot?.(spot)}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: isFocused ? 11 : 8,
                fillColor: isHighDemand ? "#ef4444" : "#f59e0b",
                fillOpacity: 0.95,
                strokeWeight: isFocused ? 4 : 2,
                strokeColor: "#ffffff",
              }}
            />
          );
        })}

        {/* Driver Current Location Marker */}
        {driverLocation && (
          <Marker
            position={driverLocation}
            title="Lokasi Anda"
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 9,
              fillColor: isOnline ? "#10b981" : "#64748b",
              fillOpacity: 1,
              strokeWeight: 3.5,
              strokeColor: "#ffffff",
            }}
          />
        )}
      </GoogleMap>

      {/* Radar Overlay Top Status */}
      <div className="absolute top-3.5 left-3.5 right-3.5 flex justify-between items-start pointer-events-none z-10">
        <div className={`px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md flex items-center gap-2 pointer-events-auto border ${
          isOnline 
            ? 'bg-emerald-600/90 text-white border-emerald-400/30' 
            : 'bg-slate-900/90 text-slate-300 border-white/10'
        }`}>
          {isOnline ? (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              <span>Radar Aktif: {activeDistrict ? activeDistrict.shortName : "5 Kecamatan Solo"}</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              <span>Radar Offline</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
