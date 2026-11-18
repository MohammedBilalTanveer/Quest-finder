// Empty in local dev (Vite proxies /api). On Vercel, set VITE_API_BASE_URL to the Render URL.
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/+$/, "");

export async function fetchQuests({ refresh = false, signal } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}/api/quests${refresh ? "?refresh=true" : ""}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new Error(
      `Cannot reach the quest server (${API_BASE || "this site's own /api"}). ` +
        "Check that the backend is running, VITE_API_BASE_URL is correct, and ALLOWED_ORIGINS includes this site's address."
    );
  }

  if (!response.ok) {
    let detail = "Unable to fetch the latest quest data.";
    try {
      const body = await response.json();
      if (typeof body.detail === "string") detail = body.detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }

  const data = await response.json();
  return validateResponse(data);
}

// Validate before the UI replaces its previous results.
export function validateResponse(data) {
  if (!data || !Array.isArray(data.results)) {
    throw new Error("The server returned an unexpected response.");
  }
  const seen = new Set();
  const results = [];
  for (const r of data.results) {
    const lat = Number(r?.latitude);
    const lng = Number(r?.longitude);
    if (
      r?.latitude == null || r?.longitude == null ||
      !Number.isFinite(lat) || !Number.isFinite(lng) ||
      Math.abs(lat) > 90 || Math.abs(lng) > 180
    ) continue;
    const id = String(r.id ?? `${lat},${lng}`);
    if (seen.has(id)) continue;
    seen.add(id);
    results.push({ ...r, id, latitude: lat, longitude: lng });
  }
  return { ...data, results };
}
