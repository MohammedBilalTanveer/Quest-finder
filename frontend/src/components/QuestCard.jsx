import { formatDistance } from "../utils/distance.js";
import { getGoogleMapsUrl } from "../utils/mapsUrl.js";
import CopyButton from "./CopyButton.jsx";

export default function QuestCard({ quest, selected, onSelect }) {
  const url = getGoogleMapsUrl(quest.latitude, quest.longitude);
  return (
    <li className={`card${selected ? " selected" : ""}`}>
      <button type="button" className="card-main" onClick={() => onSelect(quest.id)}>
        <span className="card-title">{quest.name}</span>
        <span className="card-quest">{quest.quest}</span>
        <span className="card-coords">
          {quest.latitude.toFixed(6)}, {quest.longitude.toFixed(6)}
        </span>
        {quest.distanceKm != null && (
          <span className="card-dist">{formatDistance(quest.distanceKm)} away (straight line)</span>
        )}
      </button>
      <div className="card-actions">
        <CopyButton latitude={quest.latitude} longitude={quest.longitude} />
        {url && (
          <a className="btn small" href={url} target="_blank" rel="noopener noreferrer">
            Open in Google Maps
          </a>
        )}
      </div>
    </li>
  );
}
