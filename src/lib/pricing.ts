// Simple pricing rules based on distance and service type
// Conforming to PRICING_FORMULAS.md

export function calculateFare(serviceType: string, distanceKm: number) {
  let baseFare = 0;
  let perKmFare = 0;
  let minFare = 0;
  let flatRadius = 0;

  switch (serviceType) {
    case "ojek":
    case "ojek_motor":
      baseFare = 3000;
      perKmFare = 2500;
      minFare = 10000;
      break;
    case "mobil":
    case "ojek_mobil":
      baseFare = 5000;
      perKmFare = 4500;
      minFare = 15000;
      break;
    case "kirim":
    case "kurir":
      baseFare = 5000;
      perKmFare = 3000;
      minFare = 12000;
      break;
    case "kuliner":
    case "pasar":
    case "mart":
      baseFare = 8000;
      perKmFare = 2000;
      minFare = 8000;
      flatRadius = 3;
      break;
    case "titip":
      baseFare = 5000;
      perKmFare = 3000;
      minFare = 12000;
      break;
    default:
      baseFare = 8000;
      perKmFare = 2000;
      minFare = 8000;
      break;
  }

  let total = 0;
  if (flatRadius > 0) {
    const extraKm = Math.max(0, distanceKm - flatRadius);
    total = Math.max(baseFare + extraKm * perKmFare, minFare);
  } else {
    total = Math.max(baseFare + distanceKm * perKmFare, minFare);
  }

  return { baseFare, perKmFare, total, minFare };
}
