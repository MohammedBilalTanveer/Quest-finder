import { useState } from "react";
import { parseCoord } from "../utils/distance.js";

const RADII = [1, 3, 5, 10];

export default function LocationInput({ userLocation, onLocation, radius, onRadius }) {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [msg, setMsg] = useState(null);
  const [locating, setLocating] = useState(false);

  function useMyLocation() {
    setMsg(null);
    if (!("geolocation" in navigator)) {
      setMsg("Your browser does not support location. Please enter coordinates instead.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        onLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      },
      (err) => {
        setLocating(false);
        setMsg(
          err.code === 1
            ? "Location permission was denied. You can still enter coordinates manually."
            : "Could not determine your location. You can enter coordinates manually."
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  function submitManual(e) {
    e.preventDefault();
    const la = parseCoord(lat, 90);
    const ln = parseCoord(lng, 180);
    if (la === null || ln === null) {
      setMsg("Enter a latitude between -90 and 90 and a longitude between -180 and 180.");
      return;
    }
    setMsg(null);
    onLocation({ latitude: la, longitude: ln });
  }

  function clear() {
    setMsg(null);
    setLat("");
    setLng("");
    onLocation(null);
  }

  return (
    <section className="panel" aria-label="Nearby search">
      <h2>Nearby</h2>
      <p className="hint">
        Your location stays in your browser — it is never sent to the server. It is only used to sort by distance.
      </p>
      <div className="row">
        <button type="button" className="btn" onClick={useMyLocation} disabled={locating}>
          {locating ? "Locating…" : "Use my current location"}
        </button>
      </div>
      <form className="row" onSubmit={submitManual}>
        <input aria-label="Latitude" placeholder="Latitude" inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value)} />
        <input aria-label="Longitude" placeholder="Longitude" inputMode="decimal" value={lng} onChange={(e) => setLng(e.target.value)} />
        <button type="submit" className="btn">Set</button>
      </form>
      {msg && <p className="error-text" role="alert">{msg}</p>}
      {userLocation && (
        <div className="row">
          <span className="hint">
            Using {userLocation.latitude.toFixed(5)}, {userLocation.longitude.toFixed(5)}
          </span>
          <label className="hint">
            Radius{" "}
            <select value={radius ?? ""} onChange={(e) => onRadius(e.target.value ? Number(e.target.value) : null)}>
              <option value="">Any</option>
              {RADII.map((r) => <option key={r} value={r}>{r} km</option>)}
            </select>
          </label>
          <button type="button" className="btn small" onClick={clear}>Clear location</button>
        </div>
      )}
    </section>
  );
}
