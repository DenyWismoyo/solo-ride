"use client";

import React, { useEffect, useRef } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { MAP_LIBRARIES } from "@/constants/maps";

interface PlaceAutocompleteProps {
  onPlaceSelect: (place: any) => void;
  placeholder?: string;
  className?: string;
}

export function PlaceAutocomplete({ onPlaceSelect, placeholder, className }: PlaceAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: MAP_LIBRARIES
  });

  useEffect(() => {
    if (!isLoaded || !containerRef.current) return;

    // Bersihkan kontainer jika strict mode me-render 2x
    containerRef.current.innerHTML = '';

    const autocompleteEl = document.createElement("gmp-place-autocomplete");
    if (placeholder) autocompleteEl.setAttribute("placeholder", placeholder);
    
    // Inject styling to match sleek Dark Theme
    autocompleteEl.style.width = "100%";
    autocompleteEl.style.display = "block";
    
    const styleEl = document.createElement("style");
    styleEl.textContent = `
      gmp-place-autocomplete {
        width: 100% !important;
        display: block !important;
        --gmpx-color-surface: #27272a !important;
        --gmpx-color-on-surface: #f4f4f5 !important;
        --gmpx-color-on-surface-variant: #a1a1aa !important;
        --gmpx-color-outline: #3f3f46 !important;
        --gmpx-color-primary: #10b981 !important;
        --gmpx-font-family-base: inherit !important;
        --gmp-place-autocomplete-input-background-color: #27272a !important;
        --gmp-place-autocomplete-input-color: #f4f4f5 !important;
        --gmp-place-autocomplete-input-border-radius: 0.75rem !important;
        --gmp-place-autocomplete-input-height: 46px !important;
        --gmp-place-autocomplete-input-border: 1px solid #3f3f46 !important;
        --gmp-place-autocomplete-list-background-color: #18181b !important;
        --gmp-place-autocomplete-item-text-color: #f4f4f5 !important;
        --gmp-place-autocomplete-item-secondary-text-color: #a1a1aa !important;
        --gmp-place-autocomplete-item-hover-background-color: #27272a !important;
      }
      gmp-place-autocomplete input {
        background-color: #27272a !important;
        color: #ffffff !important;
        border: 1px solid #3f3f46 !important;
        border-radius: 0.75rem !important;
        padding-left: 12px !important;
        font-size: 14px !important;
      }
    `;
    
    const handlePlaceSelect = async (e: any) => {
      const place = e.place;
      if (place) {
        try {
          await place.fetchFields({ fields: ['location', 'displayName', 'formattedAddress'] });
          onPlaceSelect(place);
        } catch (error) {
          console.error("Error fetching place fields:", error);
        }
      }
    };

    autocompleteEl.addEventListener("gmp-placeselect", handlePlaceSelect);
    
    containerRef.current.appendChild(styleEl);
    containerRef.current.appendChild(autocompleteEl);

    return () => {
      autocompleteEl.removeEventListener("gmp-placeselect", handlePlaceSelect);
    };
  }, [isLoaded, onPlaceSelect, placeholder]);

  if (!isLoaded) {
    return <div className={`h-11 bg-zinc-800 animate-pulse rounded-xl ${className}`} />;
  }

  return (
    <div className={`w-full overflow-hidden rounded-xl ${className || ""}`} ref={containerRef} />
  );
}
