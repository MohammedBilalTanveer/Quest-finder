import { useEffect, useRef } from "react";
import L from "leaflet";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { getGoogleMapsUrl } from "../utils/mapsUrl.js";
import CopyButton from "./CopyButton.jsx";
import { formatDistance } from "../utils/distance.js";

const icon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Same pin, recoloured green via CSS (.marker-done) for quests the user marked done.
const doneIcon = L.icon({ ...icon.options, className: "marker-done" });

const DEFAULT_CENTER = [40.7128, -74.006]; // only used when there are no results

// Re-fits only when the set of places (or the user location) really changes —
// NOT when a quest is marked done, so the view stays where the user left it.
function FitBounds({ quests, userLocation }) {
  const map = useMap();
  const latest = useRef({ quests, userLocation });
  latest.current = { quests, userLocation };
  const signature =
    quests.map((q) => q.id).join("|") +
    "@" +
    (userLocation ? `${userLocation.latitude},${userLocation.longitude}` : "");

  useEffect(() => {
    const { quests: qs, userLocation: loc } = latest.current;
    const points = qs.map((q) => [q.latitude, q.longitude]);
    if (loc) points.push([loc.latitude, loc.longitude]);
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 15);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 16 });
    }
  }, [signature, map]);
  return null;
}

// Moves the map only when the user picks a card (selectionKey changes).
function SelectedFocus({ quest, selectionKey, markerRefs }) {
  const map = useMap();
  const latest = useRef(quest);
  latest.current = quest;
  useEffect(() => {
    const q = latest.current;
    if (!selectionKey || !q) return;
    map.setView([q.latitude, q.longitude], Math.max(map.getZoom(), 15));
    markerRefs.current[q.id]?.openPopup();
  }, [selectionKey, map, markerRefs]);
  return null;
}

function MapGrabber({ mapRef }) {
  mapRef.current = useMap();
  return null;
}

export default function QuestMap({ quests, fitQuests, userLocation, selected, selectionKey, done, onToggleDone }) {
  const markerRefs = useRef({});
  const mapRef = useRef(null);

  // Leaflet's built-in popup auto-pan re-runs every time the popup re-renders
  // (e.g. when a quest is marked done), nudging the map. So it is disabled and
  // we pan once, only at the moment a popup opens.
  const keepPopupInView = (e) => {
    const map = mapRef.current;
    if (!map) return;
    map.panInside(e.target.getLatLng(), {
      paddingTopLeft: [20, 210],
      paddingBottomRight: [20, 40],
      animate: false,
    });
  };
  return (
    <MapContainer center={DEFAULT_CENTER} zoom={11} className="map" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapGrabber mapRef={mapRef} />
      <FitBounds quests={fitQuests} userLocation={userLocation} />
      <SelectedFocus quest={selected} selectionKey={selectionKey} markerRefs={markerRefs} />
      {quests.map((q) => {
        const url = getGoogleMapsUrl(q.latitude, q.longitude);
        return (
          <Marker
            key={q.id}
            position={[q.latitude, q.longitude]}
            icon={done[q.id] ? doneIcon : icon}
            eventHandlers={{ popupopen: keepPopupInView }}
            ref={(m) => {
              if (m) markerRefs.current[q.id] = m;
              else delete markerRefs.current[q.id];
            }}
          >
            <Popup autoPan={false}>
              <strong>{q.name}</strong>
              <br />
              {q.quest}
              <br />
              {q.latitude.toFixed(6)}, {q.longitude.toFixed(6)}
              {q.distanceKm != null && (<><br />{formatDistance(q.distanceKm)} away</>)}
              <br />
              <button type="button" className="btn small" onClick={() => onToggleDone(q.id)}>
                {done[q.id] ? "Done ✓ (undo)" : "Mark as done"}
              </button>{" "}
              <CopyButton latitude={q.latitude} longitude={q.longitude} />
              {url && (
                <>
                  <br />
                  <a href={url} target="_blank" rel="noopener noreferrer">Open in Google Maps</a>
                </>
              )}
            </Popup>
          </Marker>
        );
      })}
      {userLocation && (
        <CircleMarker
          center={[userLocation.latitude, userLocation.longitude]}
          radius={9}
          pathOptions={{ color: "#fff", weight: 3, fillColor: "#2563eb", fillOpacity: 1 }}
        >
          <Popup>Your location</Popup>
        </CircleMarker>
      )}
    </MapContainer>
  );
}
