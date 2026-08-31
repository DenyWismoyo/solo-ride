"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useGoogleMaps } from "@/components/map/GoogleMapsProvider";
import { SURAKARTA_MASTER_PLACES, SoloPlaceItem } from "@/constants/surakartaPlaces";
import { LocationPoint } from "@/types/order.types";
import { MapPin, Navigation, X, Search, Loader2, Compass, CheckCircle2, Map } from "lucide-react";

interface PlaceAutocompleteProps {
  onLocationSelect?: (location: LocationPoint) => void;
  onPlaceSelect?: (place: any) => void;
  onPickOnMapClick?: () => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
  value?: string;
}

interface PredictionItem {
  placeId?: string;
  title: string;
  subtitle: string;
  lat?: number;
  lng?: number;
  isLandmark?: boolean;
  categoryBadge?: string;
}

export function PlaceAutocomplete({ 
  onLocationSelect, 
  onPlaceSelect, 
  onPickOnMapClick,
  placeholder = "Cari jalan, kelurahan, atau tempat di Solo...", 
  className,
  initialValue = "",
  value
}: PlaceAutocompleteProps) {
  const { isLoaded } = useGoogleMaps();
  const [inputValue, setInputValue] = useState(value !== undefined ? value : initialValue);
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);

  // Sync if controlled value changes
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);

  // Initialize Google Maps services
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined" || !window.google?.maps) return;

    if (!autocompleteServiceRef.current && window.google.maps.places) {
      // @gmaps-interop
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
    }
    if (!placesServiceRef.current && window.google.maps.places) {
      const dummyDiv = document.createElement("div");
      // @gmaps-interop
      placesServiceRef.current = new window.google.maps.places.PlacesService(dummyDiv);
    }
  }, [isLoaded]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch predictions with triple-tier search engine
  const fetchPredictions = useCallback((query: string) => {
    if (!query.trim()) {
      // Show default top Surakarta recommendations
      const defaults: PredictionItem[] = SURAKARTA_MASTER_PLACES
        .filter(p => p.popularRank && p.popularRank <= 6)
        .map((l) => ({
          title: l.name,
          subtitle: l.address,
          lat: l.lat,
          lng: l.lng,
          isLandmark: true,
          categoryBadge: l.district
        }));
      setPredictions(defaults);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const lowerQuery = query.toLowerCase().trim();

    // =========================================================================
    // TIER 1: HYPERLOCAL SURAKARTA MASTER FUZZY SEARCH (54 Kelurahan + Landmarks)
    // =========================================================================
    const localMatches: PredictionItem[] = SURAKARTA_MASTER_PLACES
      .filter((p) => {
        return (
          p.name.toLowerCase().includes(lowerQuery) ||
          p.address.toLowerCase().includes(lowerQuery) ||
          p.district.toLowerCase().includes(lowerQuery)
        );
      })
      .map((p) => ({
        title: p.name,
        subtitle: p.address,
        lat: p.lat,
        lng: p.lng,
        isLandmark: true,
        categoryBadge: p.category === "kelurahan" ? "Kelurahan" : p.district
      }));

    // =========================================================================
    // TIER 2: GOOGLE MAPS AUTOCOMPLETE SERVICE (WHEN ONLINE)
    // =========================================================================
    if (autocompleteServiceRef.current && window.google?.maps) {
      try {
        autocompleteServiceRef.current.getPlacePredictions(
          {
            input: query,
            componentRestrictions: { country: "id" },
            locationBias: {
              radius: 30000,
              center: { lat: -7.5755, lng: 110.8243 },
            },
          },
          (results, status) => {
            setIsLoading(false);
            // @gmaps-interop
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
              const googleItems: PredictionItem[] = results.map((r) => ({
                placeId: r.place_id,
                title: r.structured_formatting?.main_text || r.description,
                subtitle: r.structured_formatting?.secondary_text || r.description,
                isLandmark: false,
              }));

              // Combine unique items (Local index prioritized)
              const combined = [...localMatches];
              for (const gItem of googleItems) {
                if (!combined.some((c) => c.title.toLowerCase() === gItem.title.toLowerCase())) {
                  combined.push(gItem);
                }
              }

              // Append custom query option if not an exact match
              if (!combined.some(c => c.title.toLowerCase() === lowerQuery)) {
                combined.push({
                  title: query,
                  subtitle: "Titik Alamat Kustom (Kota Surakarta)",
                  isLandmark: false,
                  categoryBadge: "Alamat Bebas"
                });
              }

              setPredictions(combined.slice(0, 8));
            } else {
              const list = [...localMatches];
              if (!list.some(c => c.title.toLowerCase() === lowerQuery)) {
                list.push({
                  title: query,
                  subtitle: "Titik Alamat Kustom (Kota Surakarta)",
                  isLandmark: false,
                  categoryBadge: "Alamat Bebas"
                });
              }
              setPredictions(list.slice(0, 8));
            }
          }
        );
      } catch (err) {
        setIsLoading(false);
        const list = [...localMatches];
        list.push({
          title: query,
          subtitle: "Titik Alamat Kustom (Kota Surakarta)",
          isLandmark: false,
          categoryBadge: "Alamat Bebas"
        });
        setPredictions(list.slice(0, 8));
      }
    } else {
      setIsLoading(false);
      const list = [...localMatches];
      list.push({
        title: query,
        subtitle: "Titik Alamat Kustom (Kota Surakarta)",
        isLandmark: false,
        categoryBadge: "Alamat Bebas"
      });
      setPredictions(list.slice(0, 8));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setIsOpen(true);
    fetchPredictions(val);
  };

  const handleFocus = () => {
    setIsOpen(true);
    fetchPredictions(inputValue);
  };

  const handleSelectPrediction = (item: PredictionItem) => {
    setInputValue(item.title);
    setIsOpen(false);

    if (item.lat !== undefined && item.lng !== undefined) {
      const point: LocationPoint = {
        lat: item.lat,
        lng: item.lng,
        address: `${item.title}, ${item.subtitle}`,
      };
      if (onLocationSelect) onLocationSelect(point);
      if (onPlaceSelect) onPlaceSelect(item);
      return;
    }

    if (item.placeId && placesServiceRef.current && window.google?.maps) {
      placesServiceRef.current.getDetails(
        {
          placeId: item.placeId,
          fields: ["geometry", "formatted_address", "name"],
        },
        (place, status) => {
          // @gmaps-interop
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const address = place.formatted_address || `${item.title}, ${item.subtitle}`;
            const point: LocationPoint = { lat, lng, address };
            if (onLocationSelect) onLocationSelect(point);
            if (onPlaceSelect) onPlaceSelect(place);
          } else {
            fallbackGeocode(item.title, item.subtitle);
          }
        }
      );
    } else {
      fallbackGeocode(item.title, item.subtitle);
    }
  };

  const fallbackGeocode = (title: string, subtitle: string) => {
    // 1. Search local 54 kelurahan & places index for fuzzy match
    const lower = title.toLowerCase();
    const match = SURAKARTA_MASTER_PLACES.find(
      p => p.name.toLowerCase().includes(lower) || p.address.toLowerCase().includes(lower)
    );

    if (match) {
      const point: LocationPoint = {
        lat: match.lat,
        lng: match.lng,
        address: `${match.name}, ${match.address}`,
      };
      if (onLocationSelect) onLocationSelect(point);
      return;
    }

    // 2. Default Surakarta coordinate fallback
    const point: LocationPoint = {
      lat: -7.5621,
      lng: 110.8547,
      address: `${title}, ${subtitle || "Surakarta"}`,
    };
    if (onLocationSelect) onLocationSelect(point);
  };

  const handleUseCurrentGPS = () => {
    if (!navigator.geolocation) {
      alert("GPS Geolocation tidak didukung oleh browser Anda.");
      return;
    }
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const address = "Lokasi Saya Saat Ini (GPS Terkini)";
        setInputValue(address);
        setIsOpen(false);
        setIsLoading(false);
        if (onLocationSelect) {
          onLocationSelect({ lat, lng, address });
        }
      },
      (err) => {
        setIsLoading(false);
        alert("Gagal membaca koordinat GPS perangkat. Pastikan izin lokasi aktif.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (predictions.length > 0) {
        handleSelectPrediction(predictions[0]);
      } else {
        handleSelectPrediction({
          title: inputValue,
          subtitle: "Kota Surakarta",
        });
      }
    }
  };

  return (
    <div className={`relative w-full ${className || ""}`} ref={containerRef}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-slate-50 dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700/80 focus:border-emerald-500 dark:focus:border-emerald-500 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none transition-all pr-14 shadow-xs"
        />

        <div className="absolute right-1.5 flex items-center gap-1">
          {inputValue ? (
            <button
              type="button"
              onClick={() => {
                setInputValue("");
                setPredictions([]);
              }}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}

          {onPickOnMapClick && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onPickOnMapClick();
              }}
              title="Pilih titik manual di peta"
              className="p-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white transition-colors cursor-pointer"
            >
              <Map className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Floating Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#0c1220] border border-slate-200/90 dark:border-white/[0.1] rounded-2xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150 backdrop-blur-2xl">
          {/* Quick Option 1: Manual Map Pin Picker */}
          {onPickOnMapClick && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onPickOnMapClick();
              }}
              className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15 border-b border-slate-100 dark:border-white/[0.06] text-xs font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer transition-colors"
            >
              <div className="p-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Map className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <span>Pilih Titik Manual Lewat Peta</span>
                <p className="text-[9px] text-slate-500 dark:text-zinc-400 font-normal">Geser pin langsung di atas peta Solo</p>
              </div>
            </button>
          )}

          {/* Quick Option 2: Current GPS Location */}
          <button
            type="button"
            onClick={handleUseCurrentGPS}
            className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15 border-b border-slate-100 dark:border-white/[0.06] text-xs font-bold text-slate-800 dark:text-zinc-200 cursor-pointer transition-colors"
          >
            <div className="p-1 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
              <Compass className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "6s" }} />
            </div>
            <div className="flex-1 min-w-0">
              <span>Gunakan Lokasi GPS Saya</span>
              <p className="text-[9px] text-slate-500 dark:text-zinc-400 font-normal">Deteksi koordinat posisi saat ini</p>
            </div>
          </button>

          {isLoading && predictions.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
              Mencari alamat di Surakarta...
            </div>
          ) : predictions.length === 0 ? (
            <button
              type="button"
              onClick={() => handleSelectPrediction({ title: inputValue, subtitle: "Kota Surakarta" })}
              className="w-full p-3 text-left flex items-center gap-2 text-xs font-bold text-emerald-600 hover:bg-emerald-500/10 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Gunakan "{inputValue}" sebagai titik alamat</span>
            </button>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
              {predictions.map((item, idx) => (
                <button
                  key={item.placeId || `${item.title}-${idx}`}
                  type="button"
                  onClick={() => handleSelectPrediction(item)}
                  className="w-full px-3 py-2 text-left flex items-start gap-2.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] cursor-pointer transition-colors group"
                >
                  <div className="p-1 rounded-lg bg-slate-100 dark:bg-zinc-800 group-hover:bg-emerald-500/20 text-slate-500 group-hover:text-emerald-500 shrink-0 mt-0.5 transition-colors">
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                        {item.title}
                      </span>
                      {item.categoryBadge && (
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded-md font-bold shrink-0">
                          {item.categoryBadge}
                        </span>
                      )}
                    </div>
                    {item.subtitle && (
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
