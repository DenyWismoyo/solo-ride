export const DEFAULT_CENTER = { lat: -7.5755, lng: 110.8243 }; // Default Surakarta (Solo), Jawa Tengah
export const DEFAULT_ZOOM = 14;
export const MAP_LIBRARIES: ("places" | "geometry")[] = ["places", "geometry"];

// --- ULTRA-CLEAN APPLE / GOOGLE MAPS LIGHT STYLE ---
export const MAP_LIGHT_STYLE = [
  {
    elementType: "geometry",
    stylers: [{ color: "#f5f5f5" }]
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "on" }]
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#334155" }]
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#ffffff" }, { weight: 3 }]
  },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#cbd5e1" }]
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#0f172a" }, { weight: "bold" }]
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#e2e8f0" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#dcfce7" }] // Soft emerald green parks
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#059669" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#e2e8f0" }]
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#fed7aa" }] // Warm highway tint
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#fdba74" }]
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [{ color: "#64748b" }]
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#f1f5f9" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#bae6fd" }] // Crisp sky blue water
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#0284c7" }]
  }
];

// --- STEALTH OBSIDIAN & CYBER DARK STYLE ---
export const MAP_DARK_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#111827" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#111827" }, { weight: 3 }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#374151" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#e5e7eb" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#064e3b" }, { lightness: -20 }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#10b981" }] },
  { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#064e3b" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#1f2937" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#374151" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#4b5563" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4b5563" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#030712" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#38bdf8" }] }
];
