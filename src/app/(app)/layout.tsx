import { ToastProvider } from "@/components/Toast";
import { TabBar } from "@/components/TabBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="app-viewport">
        <div className="app-frame">
          <div className="app-body">{children}</div>
          <TabBar />
        </div>
      </div>
    </ToastProvider>
  );
}
