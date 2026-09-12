import type { GeoPoint } from "./types";

/** Kochi city centre — the default view before the browser grants location. */
export const DEFAULT_CENTER: GeoPoint = {
  lat: 9.9816,
  lng: 76.2999,
  label: "Kochi",
};

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Great-circle distance in kilometres. */
export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** "0.4 km" / "240 m" — how distance reads in the nearby list. */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

/** "9.9816, 76.2999" — set in mono wherever coordinates are shown. */
export function formatCoords(point: GeoPoint): string {
  return `${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`;
}
