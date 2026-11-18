export function calculateDistanceKm(a, b) {
  const rad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(km < 10 ? 2 : 1)} km`;
}

// Parses a user-entered coordinate; returns null if invalid.
export function parseCoord(text, limit) {
  const s = String(text ?? "").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) && Math.abs(n) <= limit ? n : null;
}

export function withDistances(quests, location, radiusKm) {
  if (!location) return quests.map((q) => ({ ...q, distanceKm: null }));
  const list = quests
    .map((q) => ({ ...q, distanceKm: calculateDistanceKm(location, q) }))
    .sort((x, y) => x.distanceKm - y.distanceKm);
  return radiusKm ? list.filter((q) => q.distanceKm <= radiusKm) : list;
}
