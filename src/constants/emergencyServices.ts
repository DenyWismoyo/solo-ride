export const EMERGENCY_SERVICE_PREFIXES = ["damkar", "bpbd"] as const;
export type EmergencyPrefix = typeof EMERGENCY_SERVICE_PREFIXES[number];

export const isEmergencyService = (serviceId: string): boolean => {
  if (!serviceId) return false;
  return EMERGENCY_SERVICE_PREFIXES.some(prefix => serviceId.toLowerCase().includes(prefix));
};
