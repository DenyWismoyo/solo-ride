// Simple pricing rules based on distance and service type
export function calculateFare(serviceType: string, distanceKm: number) {
  // Base constants
  let baseFare = 0;
  let perKmFare = 0;

  switch (serviceType) {
    case "ojek":
    case "ojek_motor":
      baseFare = 8000;
      perKmFare = 2000;
      break;
    case "ojek_mobil":
      baseFare = 15000;
      perKmFare = 4000;
      break;
    case "kuliner":
    case "pasar":
    case "kurir":
      baseFare = 10000;
      perKmFare = 2000;
      break;
    default:
      baseFare = 10000;
      perKmFare = 2000;
      break;
  }

  const total = baseFare + (Math.max(0, distanceKm - 2) * perKmFare);
  return { baseFare, perKmFare, total };
}
