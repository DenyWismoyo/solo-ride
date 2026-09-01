"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { MAP_LIBRARIES } from "@/constants/maps";

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: Error | undefined;
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  isLoaded: false,
  loadError: undefined,
});

declare global {
  interface Window {
    __initGoogleMapsCallback?: () => void;
  }
}

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    // 1. If google.maps.Map constructor is already ready, mark ready immediately
    if (typeof window !== "undefined" && typeof window.google?.maps?.Map === "function") {
      setIsLoaded(true);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    if (!apiKey) {
      console.warn("[GoogleMapsProvider] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not defined.");
      return;
    }

    // Define the global callback that Google Maps JS API calls once all libraries are fully initialized
    window.__initGoogleMapsCallback = () => {
      if (typeof window.google?.maps?.Map === "function") {
        setIsLoaded(true);
      }
    };

    // 2. Check if the script tag is already attached to DOM
    const existingScript = document.getElementById("google-map-script") as HTMLScriptElement | null;
    if (existingScript) {
      const checkInterval = setInterval(() => {
        if (typeof window.google?.maps?.Map === "function") {
          setIsLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);

      const onExistingError = () => setLoadError(new Error("Gagal memuat Google Maps script tag."));
      existingScript.addEventListener("error", onExistingError);

      return () => {
        existingScript.removeEventListener("error", onExistingError);
        clearInterval(checkInterval);
      };
    }

    // 3. Inject script tag with exact libraries and initialization callback
    const script = document.createElement("script");
    script.id = "google-map-script";
    const libs = MAP_LIBRARIES.join(",");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libs}&v=weekly&callback=__initGoogleMapsCallback`;
    script.async = true;
    script.defer = true;

    script.onerror = () => {
      setLoadError(new Error("Gagal memuat Google Maps JavaScript API"));
    };

    document.head.appendChild(script);

    // Fallback safety polling in case callback fired before listener attached
    const fallbackPoll = setInterval(() => {
      if (typeof window.google?.maps?.Map === "function") {
        setIsLoaded(true);
        clearInterval(fallbackPoll);
      }
    }, 150);

    return () => {
      clearInterval(fallbackPoll);
    };
  }, []);

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useGoogleMaps() {
  const context = useContext(GoogleMapsContext);
  if (!context) {
    throw new Error("useGoogleMaps must be used within a GoogleMapsProvider");
  }
  return context;
}
