/**
 * Shown while a dynamic route renders on the server. Its presence is also what
 * lets Next partially prefetch these routes, so a tab tap navigates immediately
 * instead of sitting on the old screen until the server answers.
 */
export default function Loading() {
  return (
    <div className="fade-in" style={{ padding: "16px" }}>
      <div className="skeleton" style={{ height: 22, width: "45%", borderRadius: 6 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index}>
            <div className="skeleton" style={{ height: 96, borderRadius: 4 }} />
            <div className="skeleton" style={{ height: 11, width: "70%", borderRadius: 4, marginTop: 8 }} />
            <div className="skeleton" style={{ height: 9, width: "45%", borderRadius: 4, marginTop: 6 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
