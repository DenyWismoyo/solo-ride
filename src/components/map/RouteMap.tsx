"use client";

import React, { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import { useGoogleMaps } from "@/components/map/GoogleMapsProvider";
import { useTheme } from "@/components/theme/ThemeProvider";
import { DEFAULT_CENTER, DEFAULT_ZOOM, MAP_DARK_STYLE, MAP_LIGHT_STYLE } from "@/constants/maps";
import { LocationPoint } from "@/types/order.types";
import { Loader2, MapPin, Navigation, Crosshair } from "lucide-react";

interface RouteMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  pickup?: LocationPoint | null;
  dropoff?: LocationPoint | null;
  driverLocation?: { lat: number; lng: number } | null;
  directions?: google.maps.DirectionsResult | null;
  polylineColor?: string;
  className?: string;
  interactive?: boolean;
  forcedTheme?: "light" | "dark";
  manualPinMode?: "pickup" | "dropoff" | null;
  onCenterChange?: (coords: { lat: number; lng: number }) => void;
}

export function RouteMap({
  center,
  zoom = DEFAULT_ZOOM,
  pickup,
  dropoff,
  driverLocation,
  directions,
  polylineColor = "#10b981",
  className = "w-full h-full",
  interactive = true,
  forcedTheme,
  manualPinMode,
  onCenterChange,
}: RouteMapProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const { theme } = useTheme();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [useTileFallback, setUseTileFallback] = useState(false);

  // Compute effective dark mode status
  const [isDarkEffective, setIsDarkEffective] = useState(true);

  useEffect(() => {
    if (forcedTheme) {
      setIsDarkEffective(forcedTheme === "dark");
      return;
    }

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
  }, [theme, forcedTheme]);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Compute map center (Memoized to prevent snapping on every render)
  const mapCenter = useMemo(() => {
    if (center) return center;
    if (pickup) return { lat: pickup.lat, lng: pickup.lng };
    if (driverLocation) return driverLocation;
    return DEFAULT_CENTER;
  }, [center, pickup, driverLocation]);

  // Auto-fit bounds if both pickup and dropoff exist and not in manual pin mode
  useEffect(() => {
    if (!mapRef.current || !window.google?.maps || manualPinMode) return;

    if (pickup && dropoff && !directions) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend({ lat: pickup.lat, lng: pickup.lng });
      bounds.extend({ lat: dropoff.lat, lng: dropoff.lng });
      if (driverLocation) {
        bounds.extend({ lat: driverLocation.lat, lng: driverLocation.lng });
      }
      mapRef.current.fitBounds(bounds, { top: 180, right: 40, bottom: 200, left: 40 });
    }
  }, [pickup, dropoff, driverLocation, directions, manualPinMode]);

  // Update map style dynamically when theme changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setOptions({
        styles: isDarkEffective ? MAP_DARK_STYLE : MAP_LIGHT_STYLE,
      });
    }
  }, [isDarkEffective]);

  const handleIdle = useCallback(() => {
    if (mapRef.current && onCenterChange && manualPinMode) {
      const currentCenter = mapRef.current.getCenter();
      if (currentCenter) {
        onCenterChange({
          lat: currentCenter.lat(),
          lng: currentCenter.lng(),
        });
      }
    }
  }, [onCenterChange, manualPinMode]);

  // If Google Maps script has an authentication error or fails to load, render resilient interactive OSM Map
  if (loadError || useTileFallback) {
    const lat = mapCenter.lat;
    const lng = mapCenter.lng;
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.04}%2C${lat - 0.03}%2C${lng + 0.04}%2C${lat + 0.03}&layer=mapnik&marker=${lat}%2C${lng}`;

    return (
      <div className={`relative overflow-hidden w-full h-full ${isDarkEffective ? "bg-slate-900" : "bg-slate-100"} ${className}`}>
        <iframe
          src={mapUrl}
          className={`w-full h-full border-0 ${
            isDarkEffective ? "filter invert-[0.88] hue-rotate-180 brightness-95 contrast-125" : "filter brightness-100"
          }`}
          title="Surakarta Map"
        />
        {/* Manual Center Crosshair Pin */}
        {manualPinMode && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-30">
            <div className={`px-2.5 py-1 rounded-full text-white text-[10px] font-bold shadow-2xl mb-1 flex items-center gap-1.5 animate-bounce ${
              manualPinMode === "pickup" ? "bg-emerald-600" : "bg-rose-600"
            }`}>
              {manualPinMode === "pickup" ? <MapPin className="h-3.5 w-3.5" /> : <Navigation className="h-3.5 w-3.5" />}
              <span>Tentukan {manualPinMode === "pickup" ? "Jemput" : "Tujuan"}</span>
            </div>
            <div className={`w-6 h-6 rounded-full border-4 border-white shadow-2xl ${
              manualPinMode === "pickup" ? "bg-emerald-500" : "bg-rose-500"
            }`} />
            <div className="w-2 h-2 bg-black/40 rounded-full blur-[1px] mt-0.5" />
          </div>
        )}
      </div>
    );
  }

  if (!isLoaded || typeof window === "undefined" || typeof window.google?.maps?.Map !== "function") {
    return (
      <div className={`relative flex flex-col items-center justify-center ${isDarkEffective ? "bg-slate-950 text-slate-400" : "bg-slate-100 text-slate-600"} text-xs w-full h-full min-h-[300px] ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-2" />
        <span className="text-xs font-semibold">Menghubungkan Peta Surakarta...</span>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full min-h-[300px] overflow-hidden ${className}`}>
      <GoogleMap
        mapContainerStyle={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        center={mapCenter}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onIdle={handleIdle}
        options={{
          disableDefaultUI: !interactive,
          zoomControl: interactive && !manualPinMode,
          styles: isDarkEffective ? MAP_DARK_STYLE : MAP_LIGHT_STYLE,
          gestureHandling: interactive ? "greedy" : "none",
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        {/* Pickup Marker (Emerald) - only if not manually picking pickup */}
        {pickup && manualPinMode !== "pickup" && (
          <Marker
            position={{ lat: pickup.lat, lng: pickup.lng }}
            title={`Jemput: ${pickup.address}`}
            icon={
              typeof window !== "undefined" && window.google?.maps
                ? {
                    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                    fillColor: "#10b981",
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "#ffffff",
                    scale: 1.6,
                    anchor: new window.google.maps.Point(12, 22),
                  }
                : undefined
            }
          />
        )}

        {/* Dropoff Marker (Rose) - only if not manually picking dropoff */}
        {dropoff && manualPinMode !== "dropoff" && (
          <Marker
            position={{ lat: dropoff.lat, lng: dropoff.lng }}
            title={`Tujuan: ${dropoff.address}`}
            icon={
              typeof window !== "undefined" && window.google?.maps
                ? {
                    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                    fillColor: "#f43f5e",
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "#ffffff",
                    scale: 1.6,
                    anchor: new window.google.maps.Point(12, 22),
                  }
                : undefined
            }
          />
        )}

        {/* Driver Real-Time Live GPS Marker */}
        {driverLocation && !manualPinMode && (
          <Marker
            position={{ lat: driverLocation.lat, lng: driverLocation.lng }}
            title="Mitra Driver Terdekat"
            zIndex={9999}
            icon={
              typeof window !== "undefined" && window.google?.maps
                ? {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: "#10b981",
                    fillOpacity: 1,
                    strokeWeight: 3,
                    strokeColor: "#ffffff",
                  }
                : undefined
            }
          />
        )}

        {/* Route Directions Line */}
        {directions && directions.routes[0] && !manualPinMode && (
          <Polyline
            key={directions.routes[0].overview_polyline || Date.now().toString()}
            path={directions.routes[0].overview_path}
            options={{
              strokeColor: polylineColor,
              strokeWeight: 5,
              strokeOpacity: 0.9,
              clickable: false,
            }}
          />
        )}
      </GoogleMap>

      {/* Manual Center Crosshair Pin Overlay in Center of Screen */}
      {manualPinMode && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-30">
          <div className={`px-3 py-1 rounded-full text-white text-[11px] font-black shadow-2xl mb-1 flex items-center gap-1.5 animate-bounce ${
            manualPinMode === "pickup" ? "bg-emerald-600 shadow-emerald-500/50" : "bg-rose-600 shadow-rose-500/50"
          }`}>
            {manualPinMode === "pickup" ? <MapPin className="h-3.5 w-3.5" /> : <Navigation className="h-3.5 w-3.5" />}
            <span>Titik {manualPinMode === "pickup" ? "Penjemputan" : "Tujuan"}</span>
          </div>

          <div className="relative flex items-center justify-center">
            {/* Outer Target Ring */}
            <div className={`w-8 h-8 rounded-full border-4 border-white shadow-2xl animate-pulse ${
              manualPinMode === "pickup" ? "bg-emerald-500" : "bg-rose-500"
            }`} />
            {/* Center Dot */}
            <div className="absolute w-2.5 h-2.5 rounded-full bg-white" />
          </div>

          {/* Floor Shadow */}
          <div className="w-4 h-1.5 bg-black/40 rounded-full blur-[1px] mt-1" />
        </div>
      )}
    </div>
  );
}
