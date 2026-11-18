export default function StatusMessage({ kind, children }) {
  return (
    <div className={`status ${kind}`} role={kind === "error" ? "alert" : "status"}>
      {children}
    </div>
  );
}
