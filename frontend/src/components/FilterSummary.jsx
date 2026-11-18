export default function FilterSummary({ filters }) {
  return (
    <div className="filters" aria-label="Active filters">
      <span className="chip">Pokémon: <strong>{filters?.pokemon ?? "Eternatus"}</strong></span>
      <span className="chip">Quest: <strong>{filters?.task ?? "Make an Excellent Throw"}</strong></span>
    </div>
  );
}
