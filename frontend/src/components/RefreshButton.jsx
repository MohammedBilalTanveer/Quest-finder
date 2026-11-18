export default function RefreshButton({ onClick, busy }) {
  return (
    <button type="button" className="btn primary" onClick={onClick} disabled={busy}>
      {busy ? <><span className="spinner" aria-hidden="true" /> Refreshing…</> : "Refresh"}
    </button>
  );
}
