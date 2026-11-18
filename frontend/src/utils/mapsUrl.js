export function getGoogleMapsUrl(latitude, longitude) {
  if (latitude == null || longitude == null || latitude === "" || longitude === "") return null;
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return null;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
