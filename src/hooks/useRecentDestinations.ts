import { useState, useEffect, useCallback } from "react";
import { LocationPoint } from "@/types/order.types";

const STORAGE_KEY = "ride_solo_recent_destinations";
const MAX_RECENT = 5;

export function useRecentDestinations() {
  const [recentDestinations, setRecentDestinations] = useState<LocationPoint[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentDestinations(JSON.parse(stored));
      }
    } catch (err) {
      console.warn("Failed to load recent destinations from localStorage:", err);
    }
  }, []);

  const addRecentDestination = useCallback((destination: LocationPoint) => {
    setRecentDestinations((prev) => {
      // Remove any exact match to avoid duplicates (by address)
      const filtered = prev.filter(
        (p) => p.address !== destination.address
      );
      
      // Add new destination to the front
      const updated = [destination, ...filtered].slice(0, MAX_RECENT);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn("Failed to save recent destination to localStorage:", err);
      }
      
      return updated;
    });
  }, []);

  return { recentDestinations, addRecentDestination };
}
