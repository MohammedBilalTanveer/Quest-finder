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

function FitBounds({ quests, userLocation }) {
  const map = useMap();
  useEffect(() => {
    const points = quests.map((q) => [q.latitude, q.longitude]);
    if (userLocation) points.push([userLocation.latitude, userLocation.longitude]);
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 15);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 16 });
    }
  }, [quests, userLocation, map]);
  return null;
}

function SelectedFocus({ quest, markerRefs }) {
  const map = useMap();
  useEffect(() => {
    if (!quest) return;
    map.setView([quest.latitude, quest.longitude], Math.max(map.getZoom(), 15));
    markerRefs.current[quest.id]?.openPopup();
  }, [quest, map, markerRefs]);
  return null;
}

export default function QuestMap({ quests, userLocation, selected, done, onToggleDone }) {
  const markerRefs = useRef({});
  return (
    <MapContainer center={DEFAULT_CENTER} zoom={11} className="map" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds quests={quests} userLocation={userLocation} />
      <SelectedFocus quest={selected} markerRefs={markerRefs} />
      {quests.map((q) => {
        const url = getGoogleMapsUrl(q.latitude, q.longitude);
        return (
          <Marker
            key={q.id}
            position={[q.latitude, q.longitude]}
            icon={done[q.id] ? doneIcon : icon}
            ref={(m) => {
              if (m) markerRefs.current[q.id] = m;
              else delete markerRefs.current[q.id];
            }}
          >
            <Popup>
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
