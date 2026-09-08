export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-viewport">
      <div className="app-frame">
        <div className="app-body">{children}</div>
      </div>
    </div>
  );
}
