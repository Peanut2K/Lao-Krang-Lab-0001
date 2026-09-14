export default function Loading() {
  return (
    <div className="fade-in">
      <div className="skeleton" style={{ height: 240 }} />
      <div style={{ padding: 16 }}>
        <div className="skeleton" style={{ height: 18, width: "55%", borderRadius: 5 }} />
        <div className="skeleton" style={{ height: 11, width: "35%", borderRadius: 4, marginTop: 10 }} />
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="skeleton"
            style={{ height: 10, width: index === 3 ? "60%" : "100%", borderRadius: 4, marginTop: 12 }}
          />
        ))}
      </div>
    </div>
  );
}
