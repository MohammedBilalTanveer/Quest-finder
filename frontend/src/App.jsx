import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header.jsx";
import FilterSummary from "./components/FilterSummary.jsx";
import QuestMap from "./components/QuestMap.jsx";
import QuestList from "./components/QuestList.jsx";
import LocationInput from "./components/LocationInput.jsx";
import RefreshButton from "./components/RefreshButton.jsx";
import StatusMessage from "./components/StatusMessage.jsx";
import { fetchQuests } from "./services/questApi.js";
import { withDistances } from "./utils/distance.js";

export default function App() {
  const [data, setData] = useState(null); // last successful, validated response
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const inFlight = useRef(false);

  const load = useCallback(async (refresh) => {
    if (inFlight.current) return; // never overlap requests
    inFlight.current = true;
    if (refresh) setRefreshing(true);
    try {
      const result = await fetchQuests({ refresh });
      setData(result);
      setLastUpdated(new Date(result.fetchedAt));
      setError(null);
    } catch (e) {
      setError(e.message || "Unable to fetch the latest quest data.");
    } finally {
      inFlight.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  const visible = useMemo(
    () => withDistances(data?.results ?? [], userLocation, radius),
    [data, userLocation, radius]
  );
  const selected = visible.find((q) => q.id === selectedId) ?? null;
  const stale = Boolean(error && data);
  const total = data?.results.length ?? 0;

  return (
    <div className="app">
      <Header />
      <FilterSummary filters={data?.filters} />

      <div className="toolbar">
        <RefreshButton onClick={() => load(true)} busy={refreshing || loading} />
        <span className="count" aria-live="polite">
          {data ? `${visible.length} matching quest${visible.length === 1 ? "" : "s"}` : ""}
          {data && visible.length !== total ? ` (of ${total})` : ""}
        </span>
        <span className="updated">
          {lastUpdated ? `Last updated: ${lastUpdated.toLocaleString()}` : ""}
          {data?.cached ? " (cached)" : ""}
        </span>
      </div>

      {data?.sample && (
        <StatusMessage kind="warn">
          SAMPLE DATA: these are fake demo records, not real quests.
        </StatusMessage>
      )}
      {loading && !data && <StatusMessage kind="info">Loading quest data… (if the server was idle this can take up to a minute)</StatusMessage>}
      {error && (
        <StatusMessage kind="error">
          {error}
          {stale && ` Showing the last successful results from ${lastUpdated.toLocaleString()} — they may be out of date.`}
        </StatusMessage>
      )}
      {data && total === 0 && !error && (
        <StatusMessage kind="info">No matching quests found. 0 matching quests right now.</StatusMessage>
      )}
      {data && total > 0 && visible.length === 0 && (
        <StatusMessage kind="info">No matching quests within the selected radius.</StatusMessage>
      )}

      <div className="layout">
        <div className="side">
          <LocationInput
            userLocation={userLocation}
            onLocation={(loc) => {
              setUserLocation(loc);
              if (!loc) setRadius(null);
            }}
            radius={radius}
            onRadius={setRadius}
          />
          <QuestList quests={visible} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
        <div className="mapwrap">
          <QuestMap quests={visible} userLocation={userLocation} selected={selected} />
        </div>
      </div>

      <footer className="footer">
        Data from NYCPokeMap. Quests may expire or change — availability is not guaranteed when you arrive.
        Distances are straight-line. This site does not interact with Pokémon GO.
      </footer>
    </div>
  );
}
